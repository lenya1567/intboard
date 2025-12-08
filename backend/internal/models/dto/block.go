package dto

type Block struct {
	Id        string `json:"id"`
	PosX      int    `json:"x"`
	PosY      int    `json:"y"`
	Data      string `json:"data,omitempty"`
	BlockedBy string `json:"blocked"`
}

type UpdatedBlockDTO struct {
	Id     string `json:"id,omitempty"`
	Action string `json:"action"`
	Data   string `json:"data"`
}

type MoveBlockActionDTO struct {
	PosX   int  `json:"x"`
	PosY   int  `json:"y"`
	Moving bool `json:"moving"`
}

type UpdateBlockActionDTO struct {
	NewData string `json:"newData"`
	Moving  bool   `json:"moving"`
}
