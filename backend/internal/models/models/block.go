package models

type Block struct {
	PosX int    `json:"x"`
	PosY int    `json:"y"`
	Data string `json:"data"`
}

type BlockModel struct {
	PosX   int    `json:"x"`
	PosY   int    `json:"y"`
	Data   string `json:"data"`
	Moving string `json:"moving"`
}
