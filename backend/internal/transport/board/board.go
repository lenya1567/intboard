package board

import (
	"inboard-server/config"
	"inboard-server/internal/models/dto"
	"inboard-server/internal/usecase/board"
	"inboard-server/pkg/vars"

	"github.com/labstack/echo/v4"
	"github.com/zishang520/socket.io/v2/socket"
)

type IBoardService interface {
	BoardsList(req echo.Context) error
}

type BoardService struct {
	ws     *socket.Server
	u      board.IBoardUsecase
	config *config.ServerConfig
}

func CreateBoardService(boardUsecase board.IBoardUsecase, config *config.ServerConfig) *BoardService {
	return &BoardService{u: boardUsecase, config: config}
}

func (serv *BoardService) BoardsList(req echo.Context) error {
	userId := req.Request().Header.Get("User-ID")
	if userId == "" {
		return req.JSON(401, dto.ErrResponseDTO{Error: true, Message: vars.ErrUnauthorized.Error()})
	}

	boards, err := serv.u.BoardsList(req, userId)
	if err != nil {
		return req.JSON(500, dto.ErrResponseDTO{Error: true, Message: err.Error()})
	}

	return req.JSON(200, boards)
}

func (serv *BoardService) CreateBoard(req echo.Context) error {
	userId := req.Request().Header.Get("User-ID")
	if userId == "" {
		return req.JSON(401, dto.ErrResponseDTO{Error: true, Message: vars.ErrUnauthorized.Error()})
	}

	board := dto.CreateBoardDTO{}
	if err := req.Bind(&board); err != nil {
		return req.JSON(400, dto.ErrResponseDTO{Error: true, Message: err.Error()})
	}

	boardId, err := serv.u.CreateBoard(req, userId, board)
	if err != nil {
		return req.JSON(500, dto.ErrResponseDTO{Error: true, Message: err.Error()})
	}

	return req.JSON(200, dto.IdResponseDTO{Id: boardId})
}
