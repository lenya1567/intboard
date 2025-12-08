package board

import (
	"inboard-server/config"
	"inboard-server/internal/models/dto"
	"inboard-server/internal/usecase/board"
	"inboard-server/pkg/vars"

	"github.com/labstack/echo/v4"
	"github.com/playwright-community/playwright-go"
	"github.com/zishang520/socket.io/v2/socket"
)

type IBoardService interface {
	BoardsList(req echo.Context) error
	GetBoard(req echo.Context) error
	CreateBoard(req echo.Context) error
	UploadBoardImage(req echo.Context) error
	GenerateInviteLink(req echo.Context) error
	JoinBoardByLink(req echo.Context) error
}

type BoardService struct {
	ws      *socket.Server
	browser *playwright.Browser
	u       board.IBoardUsecase
	config  *config.ServerConfig
}

func CreateBoardService(browser *playwright.Browser, boardUsecase board.IBoardUsecase, config *config.ServerConfig) *BoardService {
	return &BoardService{u: boardUsecase, config: config, browser: browser}
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

func (serv *BoardService) GetBoard(req echo.Context) error {
	userId := req.Request().Header.Get("User-ID")
	if userId == "" {
		return req.JSON(401, dto.ErrResponseDTO{Error: true, Message: vars.ErrUnauthorized.Error()})
	}

	boardId := req.Param("boardId")
	if boardId == "" {
		return req.JSON(400, dto.ErrResponseDTO{Error: true, Message: vars.ErrNoBoardId.Error()})
	}

	board, err := serv.u.GetBoard(req, userId, boardId)
	if err != nil {
		return req.JSON(500, dto.ErrResponseDTO{Error: true, Message: err.Error()})
	}

	return req.JSON(200, board)
}

func (serv *BoardService) ExportPDF(req echo.Context) error {
	userId := req.Request().Header.Get("User-ID")
	if userId == "" {
		return req.JSON(401, dto.ErrResponseDTO{Error: true, Message: vars.ErrUnauthorized.Error()})
	}

	boardId := req.Param("boardId")
	if boardId == "" {
		return req.JSON(400, dto.ErrResponseDTO{Error: true, Message: vars.ErrNoBoardId.Error()})
	}

	exportType := req.QueryParam("type")
	if exportType == "" {
		return req.JSON(400, dto.ErrResponseDTO{Error: true, Message: vars.ErrNoExportType.Error()})
	}

	html, err := serv.u.ExportPDF(req, *serv.browser, userId, boardId, exportType)
	if err != nil {
		return req.JSON(500, dto.ErrResponseDTO{Error: true, Message: err.Error()})
	}

	req.Response().Header().Set(echo.HeaderContentType, "application/pdf; charset=UTF-8")

	return req.String(200, string(html))
}

func (serv *BoardService) GenerateInviteLink(req echo.Context) error {
	userId := req.Request().Header.Get("User-ID")
	if userId == "" {
		return req.JSON(401, dto.ErrResponseDTO{Error: true, Message: vars.ErrUnauthorized.Error()})
	}

	boardId := req.Param("boardId")
	if boardId == "" {
		return req.JSON(400, dto.ErrResponseDTO{Error: true, Message: vars.ErrNoBoardId.Error()})
	}

	link, err := serv.u.GenerateInviteLink(req, userId, boardId)
	if err != nil {
		return req.JSON(500, dto.ErrResponseDTO{Error: true, Message: err.Error()})
	}

	return req.JSON(200, dto.IdResponseDTO{Id: link})
}

func (serv *BoardService) JoinBoardByLink(req echo.Context) error {
	userId := req.Request().Header.Get("User-ID")
	if userId == "" {
		return req.JSON(401, dto.ErrResponseDTO{Error: true, Message: vars.ErrUnauthorized.Error()})
	}

	boardId := req.Param("boardId")
	if boardId == "" {
		return req.JSON(400, dto.ErrResponseDTO{Error: true, Message: vars.ErrNoBoardId.Error()})
	}

	controlSum := req.QueryParam("c")
	if controlSum == "" {
		return req.JSON(400, dto.ErrResponseDTO{Error: true, Message: vars.ErrNoControlSum.Error()})
	}

	err := serv.u.JoinBoardByLink(req, userId, boardId, controlSum)
	if err != nil {
		return req.JSON(500, dto.ErrResponseDTO{Error: true, Message: err.Error()})
	}

	return req.NoContent(200)
}

func (serv *BoardService) UploadBoardImage(req echo.Context) error {
	file, err := req.FormFile("image")
	if err != nil {
		return req.JSON(400, dto.ErrResponseDTO{Error: true, Message: err.Error()})
	}

	fileUrl, err := serv.u.UploadBoardImage(req, file)
	if err != nil {
		return req.JSON(500, dto.ErrResponseDTO{Error: true, Message: err.Error()})
	}

	return req.JSON(200, dto.IdResponseDTO{Id: fileUrl})
}
