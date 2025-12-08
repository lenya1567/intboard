package models

import "inboard-server/internal/models/dto"

type Board struct {
	Id          string        `json:"id"`
	Name        string        `json:"name"`
	Description string        `json:"description"`
	Author      dto.UserDTO   `json:"author"`
	IsOwner     bool          `json:"isOwner"`
	Members     []dto.UserDTO `json:"members"`
}

type BoardRedis struct {
	Blocks []string `json:"blocks"`
}

type BoardDescription struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}
