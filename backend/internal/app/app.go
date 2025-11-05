package app

import (
	"database/sql"
	"inboard-server/config"
	"inboard-server/pkg/vars"

	authProvider "inboard-server/internal/provider/auth"
	authTransport "inboard-server/internal/transport/auth"
	authUsecase "inboard-server/internal/usecase/auth"

	boardProvider "inboard-server/internal/provider/board"
	boardTransport "inboard-server/internal/transport/board"
	boardUsecase "inboard-server/internal/usecase/board"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	_ "github.com/lib/pq"
	"github.com/redis/go-redis/v9"
)

func CreateServer(config *config.ServerConfig) *echo.Echo {
	server := echo.New()

	server.HideBanner = true
	server.HidePort = true

	server.Use(middleware.LoggerWithConfig(middleware.LoggerConfig{
		Format: vars.Yellow + "${status}" + vars.Bold + vars.Green + " ${method}" + vars.Reset + vars.Blue + " ${uri}\n" + vars.Reset,
	}))
	server.Use(middleware.Recover())
	server.Use(middleware.CORS())

	db, err := sql.Open("postgres", config.Database.String)
	if err != nil {
		server.Logger.Fatal(err)
	}

	redisDB := redis.NewClient(config.RedisDatabase)

	authRepo := authProvider.CreateAuthRepository(db, config)
	authUsec := authUsecase.CreateAuthUsecase(authRepo, config)
	authServ := authTransport.CreateAuthService(authUsec, config)

	boardRepo := boardProvider.CreateBoardRepository(db, redisDB, config)
	boardUsec := boardUsecase.CreateBoardUsecase(boardRepo, config)
	boardServ := boardTransport.CreateBoardService(boardUsec, config)

	api := server.Group("/api")

	authGroup := api.Group("/auth")
	authGroup.GET("/me", authServ.GetMe)
	authGroup.PATCH("/update", authServ.UpdateUser)
	authGroup.POST("/signin", authServ.SignInUser)
	authGroup.POST("/signup", authServ.SignUpUser)
	authGroup.DELETE("/logout", authServ.Logout)

	boardGroup := api.Group("/board", authServ.AuthMiddleware)
	boardGroup.GET("/all", boardServ.BoardsList)
	boardGroup.POST("/create", boardServ.CreateBoard)
	boardServ.ConnectWs(boardGroup)

	return server
}
