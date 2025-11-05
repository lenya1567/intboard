package auth

import (
	"fmt"
	"inboard-server/config"
	"inboard-server/internal/models/dto"
	"inboard-server/internal/usecase/auth"
	"inboard-server/pkg/vars"
	"time"

	"github.com/labstack/echo/v4"
)

type IAuthService interface {
	SignUpUser(req echo.Context) error
	SignInUser(req echo.Context) error
	GetMe(req echo.Context) error
	UpdateUser(req echo.Context) error
	Logout(req echo.Context) error

	AuthMiddleware(req echo.Context) error
}

type AuthService struct {
	u      auth.IAuthUsecase
	config *config.ServerConfig
}

func CreateAuthService(authUsecase auth.IAuthUsecase, config *config.ServerConfig) *AuthService {
	return &AuthService{u: authUsecase, config: config}
}

func (serv *AuthService) SignUpUser(req echo.Context) error {
	userDTO := dto.SignUpDTO{}
	if err := req.Bind(&userDTO); err != nil {
		return req.JSON(400, dto.ErrResponseDTO{Error: true, Message: err.Error()})
	}

	sessionId, err := serv.u.SignUpUser(req, &userDTO)
	if err != nil {
		return req.JSON(400, dto.ErrResponseDTO{Error: true, Message: err.Error()})
	}

	cookieValue := fmt.Sprintf("session=%s;Expires=%s;Path=/", sessionId, time.Now().Add(time.Hour*72).UTC())
	req.Response().Header().Set(echo.HeaderSetCookie, cookieValue)
	return req.NoContent(200)
}

func (serv *AuthService) SignInUser(req echo.Context) error {
	userDTO := dto.SignInDTO{}
	if err := req.Bind(&userDTO); err != nil {
		return req.JSON(400, dto.ErrResponseDTO{Error: true, Message: err.Error()})
	}

	sessionId, err := serv.u.SignInUser(req, &userDTO)
	if err != nil {
		return req.JSON(400, dto.ErrResponseDTO{Error: true, Message: err.Error()})
	}

	cookieValue := fmt.Sprintf("session=%s;Expires=%s;Path=/", sessionId, time.Now().Add(time.Hour*72).UTC())
	req.Response().Header().Set(echo.HeaderSetCookie, cookieValue)
	return req.NoContent(200)
}

func (serv *AuthService) GetMe(req echo.Context) error {
	cookie, err := req.Cookie("session")
	if err != nil {
		return req.JSON(401, dto.ErrResponseDTO{Error: true, Message: vars.ErrNoSessionId.Error()})
	}

	userDTO, err := serv.u.GetMe(req, cookie.Value)
	if err != nil {
		return req.JSON(401, dto.ErrResponseDTO{Error: true, Message: vars.ErrNoSessionId.Error()})
	}

	return req.JSON(200, userDTO)
}

func (serv *AuthService) UpdateUser(req echo.Context) error {
	cookie, err := req.Cookie("session")
	if err != nil {
		return req.JSON(401, dto.ErrResponseDTO{Error: true, Message: vars.ErrNoSessionId.Error()})
	}

	userDTO := dto.UserDataChangeDTO{}
	if err := req.Bind(&userDTO); err != nil {
		return req.JSON(400, dto.ErrResponseDTO{Error: true, Message: err.Error()})
	}

	err = serv.u.UpdateUser(req, cookie.Value, &userDTO)
	if err != nil {
		return req.JSON(401, dto.ErrResponseDTO{Error: true, Message: err.Error()})
	}

	return req.NoContent(200)
}

func (serv *AuthService) Logout(req echo.Context) error {
	cookie, err := req.Cookie("session")
	if err != nil {
		return req.JSON(401, dto.ErrResponseDTO{Error: true, Message: vars.ErrNoSessionId.Error()})
	}

	err = serv.u.Logout(req, cookie.Value)
	if err != nil {
		return req.JSON(401, dto.ErrResponseDTO{Error: true, Message: vars.ErrNoSessionId.Error()})
	}

	req.Response().Header().Set(echo.HeaderSetCookie, "session=; Max-Age=-1")
	return req.NoContent(200)
}
