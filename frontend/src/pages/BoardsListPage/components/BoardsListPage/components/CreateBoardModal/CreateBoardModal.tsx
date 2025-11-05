import { Form } from "#widgets/Form";
import { Modal } from "#widgets/Modal";
import { useCallback } from "react";
import styles from "./CreateBoardModal.module.css";
import { TextField } from "#widgets/TextField";
import { Errors, ValidationType } from "#shared";
import { Button } from "#widgets/Button";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createBoard } from "#entities/board";

export function CreateBoardModal() {
    const navigate = useNavigate();
    const [query, setQuery] = useSearchParams();

    const handleClose = useCallback(() => setQuery({}), []);

    const handleSubmit = useCallback(async (form: Record<string, string>) => {
        const { error, data: link } = await createBoard({ name: form.name, description: form.description });
        if (error === Errors.NoError) {
            navigate(link!);
        }
    }, [navigate]);

    return <Modal opened={query.has("create")} onClose={handleClose}>
        <div className={styles.header}>Новая доска</div>
        <Form className={styles.form} onSubmit={handleSubmit}>
            <TextField
                name="name"
                title="Название:"
                validation={ValidationType.NotEmpty}
                message="Название не должно быть пустым"
            />
            <TextField
                className={styles.description}
                name="description"
                title="Описание:"
                textarea
            />
            <div className={styles.actions}>
                <Button outlined title="Отмена" onClick={handleClose} />
                <Button title="Создать доску" asSubmit />
            </div>
        </Form>
    </Modal>
}