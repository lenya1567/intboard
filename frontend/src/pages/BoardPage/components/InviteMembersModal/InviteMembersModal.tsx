import { Modal } from "#widgets/Modal";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { BoardContext } from "#entities/board/model/context";
import styles from "./InviteMembersModal.module.css";
import { Button } from "#widgets/Button";
import { getBoardInviteLink } from "#entities/board";
import { Errors } from "#shared";

export function InviteMembersModal() {
    const board = useContext(BoardContext);
    const [link, setLink] = useState<string>();
    const linkDublicate = useRef<string>("");
    const [searchParams, setSearchParams] = useSearchParams();

    const onClose = useCallback(() => {
        searchParams.delete("new-members");
        setSearchParams(searchParams);
    }, [searchParams, setSearchParams]);

    const onFetchLink = useCallback(async () => {
        if (!board?.board) return;
        const { error, data: inviteLink } = await getBoardInviteLink(board?.board?.id!);
        if (error === Errors.NoError) {
            setLink(inviteLink!);
            linkDublicate.current = inviteLink!;
        }
    }, [board, setLink, linkDublicate]);

    const onCopyInviteLink = useCallback(() => {
        navigator.clipboard.writeText(linkDublicate.current);
    }, [linkDublicate]);

    useEffect(() => {
        if (searchParams.has("new-members")) {
            onFetchLink();
        }
    }, [searchParams, onFetchLink]);

    return <Modal opened={searchParams.has("new-members")} onClose={onClose}>
        <div className={styles.header}>Добавить участников</div>
        <div className={styles.description}>
            Ссылка для присоединения:
        </div>
        <div className={styles.link}>
            {link ?? "Загрузка..."}
        </div>
        <Button disabled={!link} className={styles.button} title="Скопировать приглашение" onClick={onCopyInviteLink} />
    </Modal>
}