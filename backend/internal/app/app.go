package app

import (
	"context"
	"database/sql"
	"fmt"
	"inboard-server/config"
	"inboard-server/pkg"
	"inboard-server/pkg/vars"
	"log"

	authProvider "inboard-server/internal/provider/auth"
	authTransport "inboard-server/internal/transport/auth"
	authUsecase "inboard-server/internal/usecase/auth"

	boardProvider "inboard-server/internal/provider/board"
	boardTransport "inboard-server/internal/transport/board"
	boardUsecase "inboard-server/internal/usecase/board"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	_ "github.com/lib/pq"
	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
	"github.com/playwright-community/playwright-go"
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

	minioClient, err := minio.New(config.Minio.EndPoint, &minio.Options{
		Creds:  credentials.NewStaticV4(config.Minio.AccessKey, config.Minio.SecretKey, ""),
		Secure: false,
	})
	if err != nil {
		log.Fatalf("Error initializing MinIO client: %v", err)
	}

	bucketName := "inboard-images"
	err = minioClient.MakeBucket(context.Background(), bucketName, minio.MakeBucketOptions{})
	if err != nil {
		exists, errBucketExists := minioClient.BucketExists(context.Background(), bucketName)
		if errBucketExists == nil && exists {
			log.Printf("Bucket '%s' already exists.", bucketName)
		} else {
			log.Fatalf("Error creating bucket '%s': %v", bucketName, err)
		}
	} else {
		log.Printf("Successfully created bucket '%s'.", bucketName)
	}

	db, err := sql.Open("postgres", config.Database.String)
	if err != nil {
		server.Logger.Fatal(err)
	}

	pw, err := playwright.Run()
	if err != nil {
		server.Logger.Fatal(err)
	}

	browser, err := pw.Chromium.Launch()
	if err != nil {
		server.Logger.Fatal(err)
	}

	fmt.Print(pkg.GetConsoleMessage("PWS", "Playwrite server started", "OK"))

	redisDB := redis.NewClient(config.RedisDatabase)

	authRepo := authProvider.CreateAuthRepository(db, config)
	authUsec := authUsecase.CreateAuthUsecase(authRepo, config)
	authServ := authTransport.CreateAuthService(authUsec, config)

	boardRepo := boardProvider.CreateBoardRepository(db, redisDB, config, minioClient)
	boardUsec := boardUsecase.CreateBoardUsecase(boardRepo, config)
	boardServ := boardTransport.CreateBoardService(&browser, boardUsec, config)

	api := server.Group("/api")

	authGroup := api.Group("/auth")
	authGroup.GET("/me", authServ.GetMe)
	authGroup.PATCH("/update", authServ.UpdateUser)
	authGroup.POST("/signin", authServ.SignInUser)
	authGroup.POST("/signup", authServ.SignUpUser)
	authGroup.DELETE("/logout", authServ.Logout)

	fileGroup := api.Group("/files")
	fileGroup.POST("/upload", boardServ.UploadBoardImage)

	boardGroup := api.Group("/board", authServ.AuthMiddleware)
	boardGroup.GET("/all", boardServ.BoardsList)
	boardGroup.POST("/create", boardServ.CreateBoard)

	boardGroup.GET("/export/:boardId", boardServ.ExportPDF)
	boardGroup.GET("/link/:boardId", boardServ.GenerateInviteLink)
	boardGroup.GET("/join/:boardId", boardServ.JoinBoardByLink)

	boardGroup.GET("/:boardId", boardServ.GetBoard)
	boardServ.ConnectWs(boardGroup)

	return server
}
