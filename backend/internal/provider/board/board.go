package board

import (
	"crypto/md5"
	"database/sql"
	"encoding/json"
	"fmt"
	"inboard-server/config"
	"inboard-server/internal/models/dto"
	"inboard-server/internal/models/models"
	"inboard-server/pkg/vars"
	"mime"
	"mime/multipart"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/jaevor/go-nanoid"
	"github.com/labstack/echo/v4"
	"github.com/lib/pq"
	"github.com/minio/minio-go/v7"
	"github.com/redis/go-redis/v9"
)

type IBoardRepository interface {
	BoardsList(req echo.Context, userId string) ([]models.Board, error)
	CreateBoard(req echo.Context, userId string, board dto.CreateBoardDTO) (string, error)
	CreateBoardMember(req echo.Context, userId string, boardId string, role int) (string, error)
	CreateBoardBlock(boardId string, blockData models.Block) (dto.Block, error)

	CheckBoardMember(req echo.Context, userId string, boardId string) (bool, error)
	GetBoard(req echo.Context, userId string, boardId string) (models.BoardDescription, error)
	UpdateBoard(req echo.Context, boardId string, board dto.BoardDescriptionDTO) error
	GetBoardBlocks(boardId string) ([]dto.Block, error)

	MoveBlock(userId string, userLogin string, blockId string, blockData dto.MoveBlockActionDTO) (dto.Block, error)
	UpdateBlock(userId string, userLogin string, blockId string, blockData dto.UpdateBlockActionDTO) (dto.Block, error)
	RemoveBlock(boardId string, blockId string) error
	ClearBlockOfBlock(userId string, userLogin string, blockId string) error

	UploadBoardImage(req echo.Context, file *multipart.FileHeader) (string, error)

	GenerateInviteLink(req echo.Context, userId string, boardId string) (string, error)
}

type BoardRepositoryMutex struct {
	addBlock    sync.Mutex
	moveBlock   sync.Mutex
	removeBlock sync.Mutex
}

type BoardRepository struct {
	db      *sql.DB
	mutex   *BoardRepositoryMutex
	redisDB *redis.Client
	config  *config.ServerConfig
	minio   *minio.Client
}

func CreateBoardRepository(db *sql.DB, redisDB *redis.Client, config *config.ServerConfig, minio *minio.Client) *BoardRepository {
	mutex := &BoardRepositoryMutex{
		addBlock:    sync.Mutex{},
		moveBlock:   sync.Mutex{},
		removeBlock: sync.Mutex{},
	}
	return &BoardRepository{db: db, redisDB: redisDB, config: config, mutex: mutex, minio: minio}
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

func (repo *BoardRepository) CheckBoardMember(req echo.Context, userId string, boardId string) (bool, error) {
	var memberId string
	row := repo.db.QueryRow(
		"SELECT BM.id FROM project.board_member as BM WHERE BM.user_id = $1 AND BM.board_id = $2",
		userId, boardId,
	)

	err := row.Scan(&memberId)
	if err == sql.ErrNoRows {
		return false, nil
	}

	if err != nil {
		return false, err
	}

	return true, nil
}

func (repo *BoardRepository) GetBoard(req echo.Context, userId string, boardId string) (models.BoardDescription, error) {
	var board models.BoardDescription
	row := repo.db.QueryRow(
		"SELECT B.name, B.description FROM project.board as B WHERE B.id = $1",
		boardId,
	)

	err := row.Scan(&board.Name, &board.Description)
	if err == sql.ErrNoRows {
		return models.BoardDescription{}, nil
	}

	if err != nil {
		return models.BoardDescription{}, err
	}

	return board, nil
}

func (repo *BoardRepository) UpdateBoard(req echo.Context, boardId string, board dto.BoardDescriptionDTO) error {
	row := repo.db.QueryRow(
		"UPDATE project.board as B SET name = $2, description = $3 WHERE B.id = $1",
		boardId, board.Name, board.Description,
	)

	fmt.Println("Update", boardId, board.Name, board.Description)

	if row.Err() != nil {
		return row.Err()
	}

	return nil
}

func (repo *BoardRepository) AddBlockToBoard(boardId string, blockId string) error {
	repo.mutex.addBlock.Lock()

	boardKey := "board:" + boardId
	prevBoardDate := models.BoardRedis{
		Blocks: make([]string, 0),
	}

	prevBoardDate.Blocks = append(prevBoardDate.Blocks, blockId)

	errR := repo.redisDB.RPush(vars.RedisContext, boardKey, prevBoardDate.Blocks)
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
	blockRedisData.Data = blockData.Data
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
		Data: blockData.Data,
	}, nil
}

func (repo *BoardRepository) GetBoardBlocks(boardId string) ([]dto.Block, error) {
	boardKey := "board:" + boardId

	blocksIDs, err := repo.redisDB.LRange(vars.RedisContext, boardKey, 0, -1).Result()
	if err != nil {
		return nil, err
	}

	blocks := make([]dto.Block, 0)
	for _, blockId := range blocksIDs {
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

func (repo *BoardRepository) MoveBlock(userId string, userLogin string, blockId string, blockData dto.MoveBlockActionDTO) (dto.Block, error) {
	repo.mutex.moveBlock.Lock()

	blockKey := "block:" + blockId
	userKey := userId + "#" + userLogin

	if repo.redisDB.Exists(vars.RedisContext, blockKey).Err() != nil {
		return dto.Block{}, nil
	}

	boardStruct := models.BlockModel{}
	boardData, _ := repo.redisDB.Get(vars.RedisContext, blockKey).Bytes()

	err := json.Unmarshal(boardData, &boardStruct)
	if err != nil {
		return dto.Block{}, err
	}

	if boardStruct.Moving != "" && boardStruct.Moving != userKey {
		repo.mutex.moveBlock.Unlock()
		return dto.Block{
			Id:        blockId,
			PosX:      boardStruct.PosX,
			PosY:      boardStruct.PosY,
			BlockedBy: strings.Split(boardStruct.Moving, "#")[1],
		}, nil
	}

	boardStruct.PosX = blockData.PosX
	boardStruct.PosY = blockData.PosY

	if blockData.Moving {
		boardStruct.Moving = userKey
	} else {
		boardStruct.Moving = ""
	}

	blockDataRaw, err := json.Marshal(boardStruct)
	if err != nil {
		repo.mutex.moveBlock.Unlock()
		return dto.Block{}, err
	}

	errR := repo.redisDB.Set(vars.RedisContext, blockKey, blockDataRaw, time.Duration(time.Hour*2400))
	if errR.Err() != nil {
		repo.mutex.moveBlock.Unlock()
		return dto.Block{}, errR.Err()
	}

	repo.mutex.moveBlock.Unlock()
	return dto.Block{
		Id:   blockId,
		PosX: blockData.PosX,
		PosY: blockData.PosY,
	}, nil
}

func (repo *BoardRepository) UpdateBlock(userId string, userLogin string, blockId string, blockData dto.UpdateBlockActionDTO) (dto.Block, error) {
	repo.mutex.moveBlock.Lock()

	blockKey := "block:" + blockId
	userKey := userId + "#" + userLogin

	if repo.redisDB.Exists(vars.RedisContext, blockKey).Err() != nil {
		return dto.Block{}, nil
	}

	boardStruct := models.BlockModel{}
	boardData, _ := repo.redisDB.Get(vars.RedisContext, blockKey).Bytes()
	err := json.Unmarshal(boardData, &boardStruct)
	if err != nil {
		return dto.Block{}, err
	}

	if boardStruct.Moving != "" && boardStruct.Moving != userKey {
		repo.mutex.moveBlock.Unlock()
		return dto.Block{
			Id:        blockId,
			PosX:      boardStruct.PosX,
			PosY:      boardStruct.PosY,
			Data:      boardStruct.Data,
			BlockedBy: strings.Split(boardStruct.Moving, "#")[1],
		}, nil
	}

	if blockData.NewData != "" {
		boardStruct.Data = blockData.NewData
	}

	if blockData.Moving {
		boardStruct.Moving = userKey
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
		PosX: boardStruct.PosX,
		PosY: boardStruct.PosY,
		Data: boardStruct.Data,
	}, nil
}

func (repo *BoardRepository) ClearBlockOfBlock(userId string, userLogin string, blockId string) error {
	repo.mutex.moveBlock.Lock()

	blockKey := "block:" + blockId
	userKey := userId + "#" + userLogin

	if repo.redisDB.Exists(vars.RedisContext, blockKey).Err() != nil {
		return nil
	}

	boardStruct := models.BlockModel{}
	boardData, _ := repo.redisDB.Get(vars.RedisContext, blockKey).Bytes()
	err := json.Unmarshal(boardData, &boardStruct)
	if err != nil {
		return err
	}

	if boardStruct.Moving != "" && boardStruct.Moving != userKey {
		repo.mutex.moveBlock.Unlock()
		return nil
	}

	boardStruct.Moving = ""

	blockDataRaw, err := json.Marshal(boardStruct)
	if err != nil {
		return err
	}

	errR := repo.redisDB.Set(vars.RedisContext, blockKey, blockDataRaw, time.Duration(time.Hour*2400))
	if errR.Err() != nil {
		return errR.Err()
	}

	repo.mutex.moveBlock.Unlock()
	return nil
}

func (repo *BoardRepository) RemoveBlock(boardId string, blockId string) error {
	repo.mutex.removeBlock.Lock()

	blockKey := "block:" + blockId
	boardKey := "board:" + boardId

	err := repo.redisDB.Del(vars.RedisContext, blockKey)
	if err.Err() != nil {
		return err.Err()
	}

	_, redErr := repo.redisDB.LRem(vars.RedisContext, boardKey, 1, blockId).Result()
	if redErr != nil {
		return redErr
	}

	repo.mutex.removeBlock.Unlock()
	return nil
}

func (repo *BoardRepository) UploadBoardImage(req echo.Context, file *multipart.FileHeader) (string, error) {
	uuid := uuid.New()
	key := uuid.String() + filepath.Ext(file.Filename)

	reader, err := file.Open()
	if err != nil {
		return "", err
	}

	fileType := mime.TypeByExtension(filepath.Ext(file.Filename))

	_, err = repo.minio.PutObject(vars.MinioContext, vars.BacketName, key, reader, file.Size, minio.PutObjectOptions{ContentType: fileType})
	if err != nil {
		return "", err
	}

	link := fmt.Sprintf("%s/%s/%s", repo.config.Minio.PublicPath, vars.BacketName, key)
	return link, nil
}

func (repo *BoardRepository) GenerateInviteLink(req echo.Context, userId string, boardId string) (string, error) {
	var boardSecretKey string
	row := repo.db.QueryRow(
		"SELECT B.secret_key FROM project.board as B WHERE B.id = $1",
		boardId,
	)

	err := row.Scan(&boardSecretKey)
	if err == sql.ErrNoRows {
		return "", nil
	}

	if err != nil {
		return "", err
	}

	h := md5.New()
	h.Write([]byte(boardId))
	h.Write([]byte(repo.config.KeySecret))
	h.Write([]byte(boardSecretKey))

	key := fmt.Sprintf("%x", h.Sum(nil))
	return key, nil
}
