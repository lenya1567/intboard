package models

type Block struct {
	PosX int `json:"x"`
	PosY int `json:"y"`
}

type BlockModel struct {
	Type   string `json:"type"`
	PosX   int    `json:"x"`
	PosY   int    `json:"y"`
	Data   string `json:"data"`
	Moving string `json:"moving"`
}
