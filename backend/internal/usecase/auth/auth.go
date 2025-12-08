package auth

import (
	"inboard-server/config"
	dto "inboard-server/internal/models/dto"
	"inboard-server/internal/provider/auth"
	"inboard-server/pkg/vars"

	"github.com/labstack/echo/v4"
)

type IAuthUsecase interface {
	GetMe(req echo.Context, sessionId string) (dto.UserDTO, error)
	GetUserBySession(req echo.Context, sessionId string) (string, string, error)
	UpdateUser(req echo.Context, sessionId string, user *dto.UserDataChangeDTO) error
	SignUpUser(req echo.Context, user *dto.SignUpDTO) (string, error)
	SignInUser(req echo.Context, user *dto.SignInDTO) (string, error)
	Logout(req echo.Context, sessionId string) error
}

type AuthUsecase struct {
	rep    auth.IAuthRepository
	config *config.ServerConfig
}

func CreateAuthUsecase(authRepository auth.IAuthRepository, config *config.ServerConfig) *AuthUsecase {
	return &AuthUsecase{rep: authRepository, config: config}
}

func (usec *AuthUsecase) SignUpUser(req echo.Context, user *dto.SignUpDTO) (string, error) {
	userExists, err := usec.rep.UserExists(req, user)

	if err != nil {
		return "", err
	}

	if userExists {
		return "", vars.ErrLoginIsBusy
	}

	userId, err := usec.rep.CreateUser(req, user)
	if err != nil {
		return "", err
	}

	sessionId, err := usec.rep.CreateSession(req, userId)
	if err != nil {
		return "", err
	}

	return sessionId, nil
}

func (usec *AuthUsecase) SignInUser(req echo.Context, user *dto.SignInDTO) (string, error) {
	userId, err := usec.rep.GetUser(req, user)
	if err != nil {
		return "", err
	}

	sessionId, err := usec.rep.CreateSession(req, userId)
	if err != nil {
		return "", err
	}

	return sessionId, err
}

func (usec *AuthUsecase) GetMe(req echo.Context, sessionId string) (dto.UserDTO, error) {
	user, err := usec.rep.GetUserBySession(req, sessionId)
	if err != nil {
		return dto.UserDTO{}, err
	}

	return dto.UserDTO{DisplayName: user.DisplayName, Login: user.Login}, nil
}

func (usec *AuthUsecase) GetUserBySession(req echo.Context, sessionId string) (string, string, error) {
	userId, userLogin, err := usec.rep.GetUserIdBySession(req, sessionId)

	if err != nil {
		return "", "", err
	}

	return userId, userLogin, nil
}

func (usec *AuthUsecase) UpdateUser(req echo.Context, sessionId string, user *dto.UserDataChangeDTO) error {
	err := usec.rep.UpdateUserBySession(req, sessionId, user)

	if err != nil {
		return err
	}

	return nil
}

func (usec *AuthUsecase) Logout(req echo.Context, sessionId string) error {
	err := usec.rep.RemoveSession(req, sessionId)

	if err != nil {
		return err
	}

	return nil
}
