package vars

import "errors"

var (
	ErrNoSessionId  = errors.New("не заданы нужные cookie")
	ErrLoginIsBusy  = errors.New("данный логин уже занят")
	ErrUserNotFound = errors.New("пользователь не найден")
	ErrUnauthorized = errors.New("пользователь не найден")
)
