package board

import (
	"encoding/json"
	"inboard-server/config"
	"inboard-server/internal/models/dto"
	"inboard-server/internal/models/models"
	"inboard-server/internal/provider/board"

	"github.com/labstack/echo/v4"
)

type IBoardUsecase interface {
	BoardsList(req echo.Context, userId string) (dto.BoardsDTO, error)
	CreateBoard(req echo.Context, userId string, board dto.CreateBoardDTO) (string, error)
	CreateBoardBlock(boardId string, blockData models.Block) (dto.Block, error)
	GetBoardBlocks(boardId string) ([]dto.Block, error)
	UpdateBlock(userId string, blockId string, blockData dto.UpdatedBlockDTO) (dto.Block, error)
}

type BoardUsecase struct {
	rep    board.IBoardRepository
	config *config.ServerConfig
}

func CreateBoardUsecase(boardRepository board.IBoardRepository, config *config.ServerConfig) *BoardUsecase {
	return &BoardUsecase{rep: boardRepository, config: config}
}

func (usec *BoardUsecase) BoardsList(req echo.Context, userId string) (dto.BoardsDTO, error) {
	boards, err := usec.rep.BoardsList(req, userId)
	if err != nil {
		return dto.BoardsDTO{}, err
	}

	boardsDto := dto.BoardsDTO{}
	boardsDto.Boards = make([]dto.BoardDTO, 0)
	for _, board := range boards {
		boardsDto.Boards = append(boardsDto.Boards, dto.BoardDTO{
			Id:          board.Id,
			Name:        board.Name,
			Description: board.Description,
			IsOwner:     board.IsOwner,
			Author:      board.Author,
			Members:     board.Members,
		})
	}
	return boardsDto, nil
}

func (usec *BoardUsecase) CreateBoard(req echo.Context, userId string, board dto.CreateBoardDTO) (string, error) {
	boardId, err := usec.rep.CreateBoard(req, userId, board)
	if err != nil {
		return "", err
	}

	_, err = usec.rep.CreateBoardMember(req, userId, boardId, 100)
	if err != nil {
		return "", err
	}

	return boardId, nil
}

func (usec *BoardUsecase) CreateBoardBlock(boardId string, blockData models.Block) (dto.Block, error) {
	return usec.rep.CreateBoardBlock(boardId, blockData)
}

func (usec *BoardUsecase) GetBoardBlocks(boardId string) ([]dto.Block, error) {
	return usec.rep.GetBoardBlocks(boardId)
}

func (usec *BoardUsecase) UpdateBlock(userId string, blockId string, blockData dto.UpdatedBlockDTO) (dto.Block, error) {
	if blockData.Action == "MOVE" {
		block := dto.MoveBlockActionDTO{}
		if err := json.Unmarshal([]byte(blockData.Data), &block); err != nil {
			return dto.Block{}, err
		}
		return usec.rep.MoveBlock(userId, blockId, block)
	}
	if blockData.Action == "UPDATE" {
		block := dto.UpdateBlockActionDTO{}
		if err := json.Unmarshal([]byte(blockData.Data), &block); err != nil {
			return dto.Block{}, err
		}
		return usec.rep.UpdateBlock(userId, blockId, block)
	}
	return dto.Block{}, nil
}
