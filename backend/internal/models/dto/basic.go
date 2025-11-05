package dto

type ErrResponseDTO struct {
	Error   bool   `json:"error"`
	Message string `json:"message"`
}

type IdResponseDTO struct {
	Id string `json:"id"`
}
