package dto

type SignUpDTO struct {
	DisplayName string `json:"displayName"`
	Login       string `json:"login"`
	Password    string `json:"password"`
}

type SignInDTO struct {
	Login    string `json:"login"`
	Password string `json:"password"`
}

type UserDTO struct {
	DisplayName string `json:"displayName"`
	Login       string `json:"login"`
}

type UserDataChangeDTO struct {
	DisplayName string `json:"displayName"`
}
