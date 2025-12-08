import { Modal } from "#widgets/Modal";
import { useCallback, useContext, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { BoardContext } from "#entities/board/model/context";
import { FileUpload } from "#widgets/FileUpload";
import styles from "./UploadImageModal.module.css";
import { Button } from "#widgets/Button";
import { createBlock, uploadFile } from "#entities/board";
import { Errors } from "#shared";

export function UploadImageModal() {
    const board = useContext(BoardContext);
    const [searchParams, setSearchParams] = useSearchParams();
    const [fileSelected, setFileSelected] = useState(false);

    const onClose = useCallback(() => {
        searchParams.delete("new-image");
        setSearchParams(searchParams);
    }, [searchParams, setSearchParams]);

    const onFileSelected = useCallback(() => setFileSelected(true), [setFileSelected]);

    const onSubmit = useCallback(async (event: any) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const { error, data: link } = await uploadFile(formData);
        if (error === Errors.NoError) {
            const x = parseInt(searchParams.get("x") ?? "0") || 0;
            const y = parseInt(searchParams.get("y") ?? "0") || 0;
            const newBlock = createBlock(x, y, "image");
            newBlock.value = link!;
            board?.board?.createBlock(newBlock);

            searchParams.delete("new-image");
            searchParams.delete("x");
            searchParams.delete("y");
            setSearchParams(searchParams);
        }
    }, [searchParams, setSearchParams]);

    return <Modal opened={searchParams.has("new-image")} onClose={onClose}>
        <form onSubmit={onSubmit}>
            <div className={styles.header}>Добавить изображение</div>
            <div className={styles.description}>
                Выберите из памяти компьютера изображение для вставка:
            </div>
            <FileUpload onSelected={onFileSelected} />
            <Button className={styles.button} title="Вставить изображение" asSubmit disabled={!fileSelected} />
        </form>
    </Modal>
}