import { Button } from "#widgets/Button";
import { LoggedInPage } from "#widgets/Page";
import { useCallback, useEffect, useState } from "react";
import styles from "./BoardsListPage.module.css";
import { getBoardsList, type BoardType } from "#entities/board";
import { Errors } from "#shared";
import { BoardListItem } from "./components/BoardListItem/BoardListItem";
import { CreateBoardModal } from "./components/CreateBoardModal/CreateBoardModal";
import { useSearchParams } from "react-router-dom";

export function BoardsListPage() {
    const [, setError] = useState<boolean>(false);
    const [boards, setBoards] = useState<BoardType[]>([]);
    const [, setQuery] = useSearchParams();

    useEffect(() => {
        fetchBoards();
    }, []);

    async function fetchBoards() {
        const { error, data } = await getBoardsList();
        if (error === Errors.NoError) {
            setBoards(data!);
        } else {
            setError(true);
        }
    }

    const handleOpenCreateBoardModal = useCallback(() => setQuery({ create: "true" }), [])

    return <LoggedInPage color="background">
        <CreateBoardModal />
        <div className={styles.content}>
            <div className={styles.header}>
                <div className={styles.title}>
                    Доступные доски
                </div>
                <Button title="Создать новую доску" onClick={handleOpenCreateBoardModal} />
            </div>
            <div className={styles.boards}>
                {boards.map((board) => <BoardListItem board={board} />)}
            </div>
        </div>
    </LoggedInPage>
}