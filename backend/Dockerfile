# Этап 1: Сборка приложения
FROM golang:1.24.1 AS builder

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем исходный код в контейнер
COPY ./backend .

# Скачиваем зависимости
RUN go mod download

RUN go run github.com/playwright-community/playwright-go/cmd/playwright install --with-deps

# Собираем основное приложение
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/bin/main ./cmd/main.go

# Этап 2: Создание финального образа
FROM alpine:3.18

# Устанавливаем рабочую директорию
WORKDIR /app

RUN apk add --no-cache curl
RUN curl -fsSL https://raw.githubusercontent.com/pressly/goose/master/install.sh | sh > ./log.txt

# Копируем собранные бинарники из этапа сборки
COPY --from=builder /app/bin/main .

# Копируем папку с миграциями
COPY --from=builder /app/db/migrations ./db/migrations

# Открываем порт для приложения
EXPOSE 8080