start:
	go run ./cmd/main.go

new_migration:
	goose -dir db/migrations -s create $(name) sql

migrate:
	goose -dir db/migrations up