import { useEffect, useState } from "react";
import { BoardsListItem } from "../BoardsListItem/BoardsListItem";
import styles from "./BoardsList.module.css";
import { getBoardsList, type BoardType } from "#entities";

export function BoardsList() {
    const [items, setItems] = useState<BoardType[] | null>(null);

    useEffect(() => {
        getBoardsList().then(({ boards }) => setItems(boards!))
    }, []);

    return <div className={styles.list}>
        {
            items === null
                ? <div>Hello</div>
                : items.map((item: BoardType) =>
                    <BoardsListItem board={item} />
                )
        }
    </div>
}