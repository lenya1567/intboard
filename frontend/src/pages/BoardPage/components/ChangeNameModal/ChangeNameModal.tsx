import type { Board, BoardDescription } from "#entities/board";
import { Modal } from "#widgets/Modal";
import { useCallback, useContext } from "react";
import { useSearchParams } from "react-router-dom";
import styles from "./ChangeNameModal.module.css";
import { Form } from "#widgets/Form";
import { TextField } from "#widgets/TextField";
import { ValidationType } from "#shared";
import { Button } from "#widgets/Button";
import { BoardContext } from "#entities/board/model/context";

export function ChangeNameModal(props: { board: Board | null }) {
    const board = useContext(BoardContext)
    const [searchParams, setSearchParams] = useSearchParams();

    const onClose = useCallback(() => {
        searchParams.delete("change-name");
        setSearchParams(searchParams);
    }, [searchParams, setSearchParams]);

    const onUpdate = useCallback(async (form: Record<string, string>) => {
        board?.board?.updateBoardInformation(form as BoardDescription);
        onClose();
    }, [board, onClose]);

    return <Modal opened={searchParams.has("change-name")} onClose={onClose}>
        <div className={styles.header}>Параметры доски</div>
        <Form className={styles.form} defaultValue={props.board?.description} onSubmit={onUpdate}>
            <TextField
                name="name"
                title="Название:"
                validation={ValidationType.NotEmpty}
                message="Название не может быть пустым"
            />
            <TextField
                className={styles.description}
                name="description"
                title="Описание:"
                textarea
            />
            <div className={styles.actions}>
                <Button outlined title="Отмена" onClick={onClose} />
                <Button title="Сохранить" asSubmit needUpdate />
            </div>
        </Form>
    </Modal>
}