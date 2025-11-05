package dto

type BoardsDTO struct {
	Boards []BoardDTO `json:"boards"`
}

type BoardDTO struct {
	Id          string    `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Author      UserDTO   `json:"author"`
	IsOwner     bool      `json:"isOwner"`
	Members     []UserDTO `json:"members"`
}

type CreateBoardDTO struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}
