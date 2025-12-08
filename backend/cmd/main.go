package main

import (
	"fmt"
	"inboard-server/config"
	"inboard-server/internal/app"
	"inboard-server/pkg"
)

func main() {
	config := config.CreateServerConfig()
	server := app.CreateServer(config)

	fmt.Print(pkg.GetConsoleMessage("SVR", fmt.Sprintf("Server started at %s", config.Port), "OK"))
	server.Logger.Fatal(server.Start(":" + config.Port))
}
