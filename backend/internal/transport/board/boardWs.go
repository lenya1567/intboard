package board

import (
	"encoding/json"
	"inboard-server/internal/models/dto"
	"inboard-server/internal/models/models"
	"regexp"

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

	if len(userIdHeaders) != 1 {
		return
	}

	userId := userIdHeaders[0]
	roomId := socket.Room("board" + boardId)

	client.Join(roomId)
	room := client.To(roomId)
	allRoom := s.ws.To(roomId)

	s.SendBlocks(client, boardId)

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

		block, err := s.u.UpdateBlock(userId, blockModel.Id, blockModel)
		if err != nil {
			s.SendError(client, err)
			return
		}
		s.SendUpdatedBlock(room, block)
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

func (s *BoardService) SendNewBlock(client *socket.BroadcastOperator, block dto.Block) {
	client.Emit("new-block", block)
}

func (s *BoardService) SendUpdatedBlock(client *socket.BroadcastOperator, block dto.Block) {
	client.Emit("update-block", block)
}
