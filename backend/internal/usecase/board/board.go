package board

import (
	"encoding/json"
	"fmt"
	"inboard-server/config"
	"inboard-server/internal/models/dto"
	"inboard-server/internal/models/models"
	"inboard-server/internal/provider/board"
	"inboard-server/pkg"
	"inboard-server/pkg/vars"
	"mime/multipart"

	"github.com/labstack/echo/v4"
	"github.com/playwright-community/playwright-go"
)

type IBoardUsecase interface {
	BoardsList(req echo.Context, userId string) (dto.BoardsDTO, error)

	CreateBoard(req echo.Context, userId string, board dto.CreateBoardDTO) (string, error)
	GetBoard(req echo.Context, userId string, boardId string) (dto.BoardDescriptionDTO, error)
	UpdateBoardDescription(req echo.Context, userId string, boardId string, board dto.BoardDescriptionDTO) error

	CreateBoardBlock(boardId string, blockData models.Block) (dto.Block, error)
	GetBoardBlocks(boardId string) ([]dto.Block, error)
	UpdateBlock(userId string, userLogin string, blockId string, blockData dto.UpdatedBlockDTO) (bool, dto.Block, error)
	RemoveBlock(boardId string, blockId string) error
	ClearBlockOfBlock(userId string, userLogin string, blockId string) error

	ExportPDF(req echo.Context, browser playwright.Browser, userId string, boardId string, exportType string) ([]byte, error)
	UploadBoardImage(req echo.Context, file *multipart.FileHeader) (string, error)

	GenerateInviteLink(req echo.Context, userId string, boardId string) (string, error)
	JoinBoardByLink(req echo.Context, userId string, boardId string, controlSum string) error
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

func (usec *BoardUsecase) GetBoard(req echo.Context, userId string, boardId string) (dto.BoardDescriptionDTO, error) {
	isMember, err := usec.rep.CheckBoardMember(req, userId, boardId)
	if err != nil {
		return dto.BoardDescriptionDTO{}, err
	}
	if !isMember {
		return dto.BoardDescriptionDTO{}, vars.ErrNotMember
	}

	board, err := usec.rep.GetBoard(req, userId, boardId)
	if err != nil {
		return dto.BoardDescriptionDTO{}, err
	}

	return dto.BoardDescriptionDTO{
		Name:        board.Name,
		Description: board.Description,
	}, nil
}
func (usec *BoardUsecase) UpdateBoardDescription(req echo.Context, userId string, boardId string, board dto.BoardDescriptionDTO) error {
	err := usec.rep.UpdateBoard(req, boardId, board)
	if err != nil {
		return err
	}
	return nil
}

func (usec *BoardUsecase) CreateBoardBlock(boardId string, blockData models.Block) (dto.Block, error) {
	return usec.rep.CreateBoardBlock(boardId, blockData)
}

func (usec *BoardUsecase) GetBoardBlocks(boardId string) ([]dto.Block, error) {
	return usec.rep.GetBoardBlocks(boardId)
}

func (usec *BoardUsecase) UpdateBlock(userId string, userLogin string, blockId string, blockData dto.UpdatedBlockDTO) (bool, dto.Block, error) {
	fmt.Println(userId, userLogin, blockId, blockData)

	if blockData.Action == "MOVE" {
		block := dto.MoveBlockActionDTO{}
		if err := json.Unmarshal([]byte(blockData.Data), &block); err != nil {
			return false, dto.Block{}, err
		}

		bl, err := usec.rep.MoveBlock(userId, userLogin, blockId, block)
		return block.Moving, bl, err
	}
	if blockData.Action == "UPDATE" {
		block := dto.UpdateBlockActionDTO{}
		if err := json.Unmarshal([]byte(blockData.Data), &block); err != nil {
			return false, dto.Block{}, err
		}
		bl, err := usec.rep.UpdateBlock(userId, userLogin, blockId, block)
		return block.Moving, bl, err
	}
	return false, dto.Block{}, nil
}

func (usec *BoardUsecase) ClearBlockOfBlock(userId string, userLogin string, blockId string) error {
	return usec.rep.ClearBlockOfBlock(userId, userLogin, blockId)
}

func (usec *BoardUsecase) ExportPDF(req echo.Context, browser playwright.Browser, userId string, boardId string, exportType string) ([]byte, error) {
	boardDescription, err := usec.rep.GetBoard(req, userId, boardId)
	if err != nil {
		return []byte{}, err
	}

	blocks, err := usec.rep.GetBoardBlocks(boardId)
	if err != nil {
		return []byte{}, err
	}

	html, err := pkg.GeneratePDF(browser, boardDescription, blocks)

	if err != nil {
		return []byte{}, err
	}

	return html, nil
}

func (usec *BoardUsecase) RemoveBlock(boardId string, blockId string) error {
	return usec.rep.RemoveBlock(boardId, blockId)
}

func (usec *BoardUsecase) UploadBoardImage(req echo.Context, file *multipart.FileHeader) (string, error) {
	return usec.rep.UploadBoardImage(req, file)
}

func (usec *BoardUsecase) GenerateInviteLink(req echo.Context, userId string, boardId string) (string, error) {
	isMember, err := usec.rep.CheckBoardMember(req, userId, boardId)
	if err != nil {
		return "", err
	}

	if !isMember {
		return "", vars.ErrNotMember
	}

	link, err := usec.rep.GenerateInviteLink(req, userId, boardId)
	if err != nil {
		return "", err
	}

	return link, nil
}

func (usec *BoardUsecase) JoinBoardByLink(req echo.Context, userId string, boardId string, controlSum string) error {
	isMember, err := usec.rep.CheckBoardMember(req, userId, boardId)
	if err != nil {
		return err
	}

	if isMember {
		return nil
	}

	link, err := usec.rep.GenerateInviteLink(req, userId, boardId)
	if err != nil {
		return err
	}

	if link != controlSum {
		return vars.ErrWrongInvite
	}

	_, err = usec.rep.CreateBoardMember(req, userId, boardId, 100)
	if err != nil {
		return err
	}

	return nil
}
