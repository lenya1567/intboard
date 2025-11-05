-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS project.board (
    id uuid PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    description VARCHAR(256) NOT NULL,
    author uuid REFERENCES project.user(id),
    secret_key VARCHAR(256) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE project.board;
-- +goose StatementEnd
