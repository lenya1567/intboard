-- +goose Up
-- +goose StatementBegin
CREATE SCHEMA project;

CREATE TABLE IF NOT EXISTS project.user (
    id uuid PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    login VARCHAR(255) NOT NULL,
    password BYTEA NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS project.user_session (
    id uuid PRIMARY KEY,
    user_id uuid REFERENCES project.user(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE project.user_session;
DROP TABLE project.user;
DROP SCHEMA project;
-- +goose StatementEnd
