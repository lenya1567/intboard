package board

import (
	"encoding/json"
	"fmt"
	"inboard-server/internal/models/dto"
	"inboard-server/internal/models/models"
	"regexp"
	"sync"

	"github.com/labstack/echo/v4"
	"github.com/zishang520/socket.io/v2/socket"
)

func ParseBoardId(path string) string {
	r := regexp.MustCompile(`\/api\/board\/ws.(?<boardId>[\w-]*)`)
	matches := r.FindStringSubmatch(path)
	return matches[r.SubexpIndex("boardId")]
}

func (s *BoardService) ConnectWs(group *echo.Group) {
	s.ws = socket.NewServer(nil, nil)
	wsHandler := s.ws.ServeHandler(nil)

	s.ws.On("connection", func(clients ...any) {
		client := clients[0].(*socket.Socket)
		s.ConnectUser(client)
	})

	group.Any("/ws/:boardId/", func(context echo.Context) error {
		wsHandler.ServeHTTP(context.Response(), context.Request())
		return nil
	})
}

func (s *BoardService) ConnectUser(client *socket.Socket) {
	boardId := ParseBoardId(client.Handshake().Url)
	userIdHeaders := client.Handshake().Headers["User-Id"]
	userNameHeaders := client.Handshake().Headers["User-Name"]

	mutex := sync.Mutex{}
	myBlockedBlock := ""

	if len(userIdHeaders) != 1 {
		return
	}

	if len(userNameHeaders) != 1 {
		return
	}

	userId := userIdHeaders[0]
	userName := userNameHeaders[0]
	roomId := socket.Room("board" + boardId)

	client.Join(roomId)
	room := client.To(roomId)
	allRoom := s.ws.To(roomId)

	s.SendBlocks(client, boardId)

	client.On("disconnect", func(args ...any) {
		fmt.Println("Закрылось соединение")
		if myBlockedBlock != "" {
			fmt.Println("Необходимо разблокировать", myBlockedBlock)
			s.u.ClearBlockOfBlock(userId, userName, myBlockedBlock)
		}
	})

	client.On("update-information", func(args ...any) {
		data := args[0].(string)
		board := dto.BoardDescriptionDTO{}
		if err := json.Unmarshal([]byte(data), &board); err != nil {
			s.SendError(client, err)
			return
		}

		err := s.u.UpdateBoardDescription(nil, userId, boardId, board)
		if err != nil {
			s.SendError(client, err)
			return
		}
		s.SendInformationUpdate(room, board)
	})

	client.On("create-block", func(args ...any) {
		data := args[0].(string)
		blockModel := models.Block{}
		if err := json.Unmarshal([]byte(data), &blockModel); err != nil {
			s.SendError(client, err)
			return
		}

		block, err := s.u.CreateBoardBlock(boardId, blockModel)

		if err != nil {
			s.SendError(client, err)
			return
		}
		s.SendNewBlock(allRoom, block)
	})

	client.On("update-block", func(args ...any) {
		data := args[0].(string)
		blockModel := dto.UpdatedBlockDTO{}
		if err := json.Unmarshal([]byte(data), &blockModel); err != nil {
			s.SendError(client, err)
			return
		}

		blocked, block, err := s.u.UpdateBlock(userId, userName, blockModel.Id, blockModel)
		if err != nil {
			s.SendError(client, err)
			return
		}

		if block.BlockedBy == "" {
			if blocked {
				block.BlockedBy = userName
			}
			s.SendUpdatedBlock(room, block)
		} else {
			s.SendUpdatedBlock(allRoom, block)
		}

		if block.BlockedBy == "" {
			mutex.Lock()
			myBlockedBlock = block.Id
			mutex.Unlock()
		}
	})

	client.On("remove-block", func(args ...any) {
		data := args[0].(string)
		idDto := dto.IdResponseDTO{}
		if err := json.Unmarshal([]byte(data), &idDto); err != nil {
			s.SendError(client, err)
			return
		}

		err := s.u.RemoveBlock(boardId, idDto.Id)
		if err != nil {
			s.SendError(client, err)
			return
		}
		s.SendRemovedBlock(allRoom, idDto.Id)
	})
}

func (s *BoardService) SendError(client *socket.Socket, err error) {
	client.Emit("error", err.Error())
}

func (s *BoardService) SendBlocks(client *socket.Socket, boardId string) {
	blocks, err := s.u.GetBoardBlocks(boardId)
	if err != nil {
		s.SendError(client, err)
		return
	}

	client.Emit("all-blocks", blocks)
}

func (s *BoardService) SendInformationUpdate(client *socket.BroadcastOperator, block dto.BoardDescriptionDTO) {
	client.Emit("update-information", block)
}

func (s *BoardService) SendNewBlock(client *socket.BroadcastOperator, block dto.Block) {
	client.Emit("new-block", block)
}

func (s *BoardService) SendUpdatedBlock(client *socket.BroadcastOperator, block dto.Block) {
	client.Emit("update-block", block)
}

func (s *BoardService) SendRemovedBlock(client *socket.BroadcastOperator, id string) {
	client.Emit("remove-block", id)
}
