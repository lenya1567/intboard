-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS project.board_member (
    id uuid PRIMARY KEY,
    user_id uuid REFERENCES project.user(id),
    board_id uuid REFERENCES project.board(id),
    role integer,
    join_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE project.board_member;
-- +goose StatementEnd