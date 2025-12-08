package auth

import (
	"crypto/sha256"
	"database/sql"
	"fmt"
	"inboard-server/config"
	dto "inboard-server/internal/models/dto"
	"inboard-server/internal/models/models"
	"inboard-server/pkg/vars"

	"github.com/labstack/echo/v4"
)

type IAuthRepository interface {
	GetUser(req echo.Context, user *dto.SignInDTO) (string, error)
	GetUserBySession(req echo.Context, sessionId string) (models.UserModel, error)
	GetUserIdBySession(req echo.Context, sessionId string) (string, string, error)
	UpdateUserBySession(req echo.Context, sessionId string, user *dto.UserDataChangeDTO) error
	UserExists(req echo.Context, user *dto.SignUpDTO) (bool, error)
	CreateUser(req echo.Context, user *dto.SignUpDTO) (string, error)
	CreateSession(req echo.Context, userId string) (string, error)
	RemoveSession(req echo.Context, sessionId string) error
}

type AuthRepository struct {
	db     *sql.DB
	config *config.ServerConfig
}

func CreateAuthRepository(db *sql.DB, config *config.ServerConfig) *AuthRepository {
	return &AuthRepository{db: db, config: config}
}

func (repo *AuthRepository) UserExists(req echo.Context, user *dto.SignUpDTO) (bool, error) {
	var userId string
	row := repo.db.QueryRow("SELECT id FROM project.user as U WHERE U.login = $1;", user.Login)
	err := row.Scan(&userId)

	if err == sql.ErrNoRows {
		return false, nil
	}

	return err == nil, err
}

func (repo *AuthRepository) GetUser(req echo.Context, user *dto.SignInDTO) (string, error) {
	h := sha256.New()
	h.Write([]byte(repo.config.PasswordSecret))
	h.Write([]byte(user.Password))

	var userId string
	row := repo.db.QueryRow(
		"SELECT id FROM project.user as U WHERE U.login = $1 AND U.password = $2;",
		user.Login, h.Sum(nil),
	)

	err := row.Scan(&userId)
	if err == sql.ErrNoRows {
		return "", vars.ErrUserNotFound
	}

	if err != nil {
		return "", err
	}

	return userId, nil
}

func (repo *AuthRepository) GetUserBySession(req echo.Context, sessionId string) (models.UserModel, error) {
	var user models.UserModel
	row := repo.db.QueryRow(
		"SELECT U.name, U.login FROM project.user as U, project.user_session as SU WHERE SU.id = $1 AND SU.user_id = U.id",
		sessionId,
	)

	err := row.Scan(&user.DisplayName, &user.Login)
	if err == sql.ErrNoRows {
		return models.UserModel{}, vars.ErrUserNotFound
	}

	if err != nil {
		return models.UserModel{}, err
	}

	return user, nil
}

func (repo *AuthRepository) GetUserIdBySession(req echo.Context, sessionId string) (string, string, error) {
	var userId string
	var userLogin string
	row := repo.db.QueryRow(
		"SELECT U.id, U.name FROM project.user as U, project.user_session as SU WHERE SU.id = $1 AND SU.user_id = U.id",
		sessionId,
	)

	err := row.Scan(&userId, &userLogin)
	if err == sql.ErrNoRows {
		return "", "", vars.ErrUserNotFound
	}

	if err != nil {
		return "", "", err
	}

	return userId, userLogin, nil
}

func (repo *AuthRepository) UpdateUserBySession(req echo.Context, sessionId string, user *dto.UserDataChangeDTO) error {
	fmt.Println(sessionId)

	_, err := repo.db.Exec(
		"UPDATE project.user as U SET name = $1 FROM project.user_session as SU WHERE SU.id = $2 AND SU.user_id = U.id",
		user.DisplayName, sessionId,
	)

	if err != nil {
		return err
	}

	return nil
}

func (repo *AuthRepository) CreateUser(req echo.Context, user *dto.SignUpDTO) (string, error) {
	h := sha256.New()
	h.Write([]byte(repo.config.PasswordSecret))
	h.Write([]byte(user.Password))

	row := repo.db.QueryRow(
		`INSERT INTO project.user(id, name, login, password) VALUES (gen_random_uuid(), $1, $2, $3) RETURNING (id)`,
		user.DisplayName, user.Login, h.Sum(nil),
	)

	var userId string
	if err := row.Scan(&userId); err != nil {
		return "", err
	}

	return userId, nil
}

func (repo *AuthRepository) CreateSession(req echo.Context, userId string) (string, error) {
	row := repo.db.QueryRow(
		`INSERT INTO project.user_session(id, user_id) VALUES (gen_random_uuid(), $1) RETURNING (id)`,
		userId,
	)

	var sessionId string
	if err := row.Scan(&sessionId); err != nil {
		return "", err
	}

	return sessionId, nil
}

func (repo *AuthRepository) RemoveSession(req echo.Context, sessionId string) error {
	_, err := repo.db.Exec(
		`DELETE FROM project.user_session WHERE id = $1`,
		sessionId,
	)

	if err != nil {
		return err
	}

	return nil
}
