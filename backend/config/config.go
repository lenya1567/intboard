package config

import (
	"fmt"
	"os"

	"github.com/joho/godotenv"
	"github.com/redis/go-redis/v9"
)

type ServerConfig struct {
	IP             string
	Port           string
	PasswordSecret string

	Database      *DBConfig
	RedisDatabase *redis.Options
}

type DBConfig struct {
	Port     string
	UserName string
	Password string
	Name     string
	String   string
}

func init() {
	if err := godotenv.Load(); err != nil {
		panic("No .env file found")
	}
}

func CreateServerConfig() *ServerConfig {

	ip := os.Getenv("SERVER_IP")
	port := os.Getenv("SERVER_PORT")
	secret := os.Getenv("PASSWORD_SECRET")

	if ip == "" {
		panic("No SERVER_IP in .env!")
	}

	if port == "" {
		panic("No SERVER_PORT in .env!")
	}

	if secret == "" {
		panic("No PASSWORD_SECRET in .env!")
	}

	dbConfig := createDBConfig()
	redisConfig := createRedisDBConfig()
	return &ServerConfig{IP: ip, Port: port, PasswordSecret: secret, Database: dbConfig, RedisDatabase: redisConfig}
}

func createDBConfig() *DBConfig {
	dbPort := os.Getenv("POSTGRES_PORT")
	dbUser := os.Getenv("POSTGRES_USER")
	dbPassword := os.Getenv("POSTGRES_PASSWORD")
	dbName := os.Getenv("POSTGRES_DB")

	if dbPort == "" {
		panic("No POSTGRES_PORT in .env!")
	}

	if dbUser == "" {
		panic("No POSTGRES_USER in .env!")
	}

	if dbPassword == "" {
		panic("No POSTGRES_PASSWORD in .env!")
	}

	if dbName == "" {
		panic("No POSTGRES_DB in .env!")
	}

	dbString := fmt.Sprintf("host=localhost port=%s user=%s password=%s dbname=%s sslmode=disable", dbPort, dbUser, dbPassword, dbName)

	return &DBConfig{
		Port:     dbPort,
		UserName: dbUser,
		Password: dbPassword,
		Name:     dbName,
		String:   dbString,
	}
}

func createRedisDBConfig() *redis.Options {
	dbPort := os.Getenv("REDIS_PORT")
	dbPassword := os.Getenv("REDIS_PASSWORD")
	dbName := os.Getenv("REDIS_DATABASE")

	if dbPort == "" {
		panic("No REDIS_PORT in .env!")
	}

	if dbPassword == "" {
		panic("No REDIS_PASSWORD in .env!")
	}

	if dbName == "" {
		panic("No REDIS_DATABASE in .env!")
	}

	return &redis.Options{
		Addr:     "localhost:" + dbPort,
		Password: dbPassword,
	}
}
