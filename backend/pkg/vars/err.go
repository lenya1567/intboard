package vars

import "errors"

var (
	ErrNoSessionId  = errors.New("не заданы нужные cookie")
	ErrLoginIsBusy  = errors.New("данный логин уже занят")
	ErrUserNotFound = errors.New("пользователь не найден")
	ErrUnauthorized = errors.New("пользователь не найден")
	ErrNotMember    = errors.New("не является участников доски")
	ErrNoBoardId    = errors.New("не задан id доски")
	ErrNoExportType = errors.New("не задан тип экспорта")
	ErrNoControlSum = errors.New("не задана проверочная строка")
	ErrWrongInvite  = errors.New("приглашение не действительно")
)
