package board

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"inboard-server/config"
	"inboard-server/internal/models/dto"
	"inboard-server/internal/models/models"
	"inboard-server/pkg/vars"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/jaevor/go-nanoid"
	"github.com/labstack/echo/v4"
	"github.com/lib/pq"
	"github.com/redis/go-redis/v9"
)

type IBoardRepository interface {
	BoardsList(req echo.Context, userId string) ([]models.Board, error)
	CreateBoard(req echo.Context, userId string, board dto.CreateBoardDTO) (string, error)
	CreateBoardMember(req echo.Context, userId string, boardId string, role int) (string, error)
	CreateBoardBlock(boardId string, blockData models.Block) (dto.Block, error)
	GetBoardBlocks(boardId string) ([]dto.Block, error)
	MoveBlock(userId string, blockId string, blockData dto.MoveBlockActionDTO) (dto.Block, error)
	UpdateBlock(userId string, blockId string, blockData dto.UpdateBlockActionDTO) (dto.Block, error)
}

type BoardRepositoryMutex struct {
	addBlock  sync.Mutex
	moveBlock sync.Mutex
}

type BoardRepository struct {
	db      *sql.DB
	mutex   *BoardRepositoryMutex
	redisDB *redis.Client
	config  *config.ServerConfig
}

func CreateBoardRepository(db *sql.DB, redisDB *redis.Client, config *config.ServerConfig) *BoardRepository {
	mutex := &BoardRepositoryMutex{
		addBlock:  sync.Mutex{},
		moveBlock: sync.Mutex{},
	}
	return &BoardRepository{db: db, redisDB: redisDB, config: config, mutex: mutex}
}

func (repo *BoardRepository) CreateBoard(req echo.Context, userId string, board dto.CreateBoardDTO) (string, error) {
	boardSecret, _ := nanoid.ASCII(32)

	fmt.Println(userId, board.Name, board.Description, "--")

	row := repo.db.QueryRow(
		"INSERT INTO project.board(id, name, description, author, secret_key) VALUES (gen_random_uuid(), $1, $2, $3, $4) RETURNING (id)",
		board.Name, board.Description, userId, boardSecret(),
	)

	if row.Err() != nil {
		return "", row.Err()
	}

	boardId := ""
	row.Scan(&boardId)

	return boardId, nil
}

func (repo *BoardRepository) CreateBoardMember(req echo.Context, userId string, boardId string, role int) (string, error) {
	row := repo.db.QueryRow(
		`INSERT INTO project.board_member(id, user_id, board_id, role) VALUES (gen_random_uuid(), $1, $2, $3) RETURNING (id)`,
		userId, boardId, role,
	)

	if row.Err() != nil {
		return "", row.Err()
	}

	boardMemberId := ""
	row.Scan(&boardMemberId)

	return boardMemberId, nil
}

func (repo *BoardRepository) BoardsList(req echo.Context, userId string) ([]models.Board, error) {
	rows, err := repo.db.Query(
		`SELECT B.id, B.name, B.description, A.name as author_name, A.login as author_login, ARRAY_AGG(to_json((U.login, U.name)::project.user_type)) as members,
			A.id = $1 as is_author
		FROM project.board as B, project.user as U, project.user as A, project.board_member as BM2
		WHERE 
			EXISTS(
				SELECT BM.id 
				FROM project.board_member as BM 
				WHERE BM.board_id = B.id AND BM.user_id = $1
			)
			AND B.author = A.id AND BM2.user_id = U.id AND BM2.board_id = B.id
		GROUP BY B.id, author_name, author_login, A.id`,
		userId,
	)

	if err != nil {
		return []models.Board{}, err
	}

	boards := make([]models.Board, 0)
	for rows.Next() {
		board := models.Board{}
		people := make([]string, 0)

		rows.Scan(
			&board.Id,
			&board.Name,
			&board.Description,
			&board.Author.DisplayName,
			&board.Author.Login,
			pq.Array(&people),
			&board.IsOwner,
		)

		board.Members = make([]dto.UserDTO, 0)
		for _, person := range people {
			userDto := dto.UserDTO{}
			if err := json.Unmarshal([]byte(person), &userDto); err != nil {
				return []models.Board{}, err
			}
			board.Members = append(board.Members, userDto)
		}
		boards = append(boards, board)
	}

	return boards, nil
}

func (repo *BoardRepository) AddBlockToBoard(boardId string, blockId string) error {
	repo.mutex.addBlock.Lock()

	boardKey := "board:" + boardId
	prevBoardDate := models.BoardRedis{
		Blocks: make([]string, 0),
	}

	if repo.redisDB.Exists(vars.RedisContext, boardKey).Err() == nil {
		boardData, _ := repo.redisDB.Get(vars.RedisContext, boardKey).Bytes()
		json.Unmarshal(boardData, &prevBoardDate)
	}

	prevBoardDate.Blocks = append(prevBoardDate.Blocks, blockId)

	newData, err := json.Marshal(prevBoardDate)
	if err != nil {
		return err
	}

	errR := repo.redisDB.Set(vars.RedisContext, boardKey, newData, time.Duration(time.Hour*2400))
	if errR.Err() != nil {
		return errR.Err()
	}

	repo.mutex.addBlock.Unlock()
	return nil
}

func (repo *BoardRepository) CreateBoardBlock(boardId string, blockData models.Block) (dto.Block, error) {
	blockId := uuid.New().String()

	err := repo.AddBlockToBoard(boardId, blockId)
	if err != nil {
		return dto.Block{}, err
	}

	blockRedisData := models.BlockModel{}
	blockRedisData.Type = "text"
	blockRedisData.Data = ""
	blockRedisData.Moving = ""
	blockRedisData.PosX = blockData.PosX
	blockRedisData.PosY = blockData.PosY

	blockDataRaw, err := json.Marshal(blockRedisData)
	if err != nil {
		return dto.Block{}, err
	}

	blockKey := "block:" + blockId
	errR := repo.redisDB.Set(vars.RedisContext, blockKey, blockDataRaw, time.Duration(time.Hour*2400))

	if errR.Err() != nil {
		return dto.Block{}, errR.Err()
	}

	return dto.Block{
		Id:   blockId,
		PosX: blockData.PosX,
		PosY: blockData.PosY,
	}, nil
}

func (repo *BoardRepository) GetBoardBlocks(boardId string) ([]dto.Block, error) {
	boardKey := "board:" + boardId

	boardData, err := repo.redisDB.Get(vars.RedisContext, boardKey).Bytes()
	if err != nil {
		return make([]dto.Block, 0), nil
	}

	board := models.BoardRedis{}
	err = json.Unmarshal(boardData, &board)
	if err != nil {
		return nil, err
	}

	blocks := make([]dto.Block, 0)
	for _, blockId := range board.Blocks {
		blockKey := "block:" + blockId
		blockData, err := repo.redisDB.Get(vars.RedisContext, blockKey).Bytes()

		boardBlock := dto.Block{}
		if err = json.Unmarshal(blockData, &boardBlock); err != nil {
			return nil, err
		}
		boardBlock.Id = blockId

		blocks = append(blocks, boardBlock)
	}

	return blocks, nil
}

func (repo *BoardRepository) MoveBlock(userId string, blockId string, blockData dto.MoveBlockActionDTO) (dto.Block, error) {
	repo.mutex.moveBlock.Lock()

	blockKey := "block:" + blockId

	if repo.redisDB.Exists(vars.RedisContext, blockKey).Err() != nil {
		return dto.Block{}, nil
	}

	boardStruct := models.BlockModel{}
	boardData, _ := repo.redisDB.Get(vars.RedisContext, blockKey).Bytes()

	err := json.Unmarshal(boardData, &boardStruct)
	if err != nil {
		return dto.Block{}, err
	}

	if boardStruct.Moving != "" && boardStruct.Moving != userId {
		return dto.Block{
			Id:   blockId,
			PosX: boardStruct.PosX,
			PosY: boardStruct.PosY,
		}, nil
	}

	boardStruct.PosX = blockData.PosX
	boardStruct.PosY = blockData.PosY

	if blockData.Moving {
		boardStruct.Moving = userId
	} else {
		boardStruct.Moving = ""
	}

	blockDataRaw, err := json.Marshal(boardStruct)
	if err != nil {
		return dto.Block{}, err
	}

	errR := repo.redisDB.Set(vars.RedisContext, blockKey, blockDataRaw, time.Duration(time.Hour*2400))
	if errR.Err() != nil {
		return dto.Block{}, errR.Err()
	}

	repo.mutex.moveBlock.Unlock()
	return dto.Block{
		Id:   blockId,
		PosX: blockData.PosX,
		PosY: blockData.PosY,
	}, nil
}

func (repo *BoardRepository) UpdateBlock(userId string, blockId string, blockData dto.UpdateBlockActionDTO) (dto.Block, error) {
	repo.mutex.moveBlock.Lock()

	blockKey := "block:" + blockId

	if repo.redisDB.Exists(vars.RedisContext, blockKey).Err() != nil {
		return dto.Block{}, nil
	}

	boardStruct := models.BlockModel{}
	boardData, _ := repo.redisDB.Get(vars.RedisContext, blockKey).Bytes()
	err := json.Unmarshal(boardData, &boardStruct)
	if err != nil {
		return dto.Block{}, err
	}

	boardStruct.Data = blockData.NewData

	blockDataRaw, err := json.Marshal(boardStruct)
	if err != nil {
		return dto.Block{}, err
	}

	errR := repo.redisDB.Set(vars.RedisContext, blockKey, blockDataRaw, time.Duration(time.Hour*2400))
	if errR.Err() != nil {
		return dto.Block{}, errR.Err()
	}

	repo.mutex.moveBlock.Unlock()
	return dto.Block{
		Id:   blockId,
		PosX: boardStruct.PosX,
		PosY: boardStruct.PosY,
		Data: boardStruct.Data,
	}, nil
}
