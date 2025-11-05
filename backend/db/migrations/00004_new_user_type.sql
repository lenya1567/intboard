-- +goose Up
-- +goose StatementBegin
CREATE TYPE project.user_type AS (
    login varchar(255),
    displayName varchar(255)
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TYPE project.user_type
-- +goose StatementEnd
