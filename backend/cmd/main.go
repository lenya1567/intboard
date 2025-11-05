package main

import (
	"inboard-server/config"
	"inboard-server/internal/app"
)

func main() {
	config := config.CreateServerConfig()
	server := app.CreateServer(config)

	server.Logger.Fatal(server.Start(config.IP + ":" + config.Port))
}
