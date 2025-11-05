import type { BoardType } from "#entities/board";
import { Avatar } from "#widgets/Avatar";
import { useNavigate } from "react-router-dom";
import styles from "./BoardListItem.module.css";
import { useCallback } from "react";

type BoardListItemProps = {
    board: BoardType;
}

export function BoardListItem({ board }: BoardListItemProps) {
    const navigate = useNavigate();

    const openBoard = useCallback(() => {
        console.log("YES");
        navigate(`/board/${board.id}`);
    }, [navigate]);

    return <div className={styles.item} onClick={openBoard}>
        <div className={styles.card}>
            <div className={styles.title}>{board.name}</div>
            <div className={styles.description}>{board.description}</div>
        </div>
        <div className={styles.members}>
            {board.members.map((member, index) =>
                <div className={styles.member}>
                    <Avatar displayName={member.displayName} colorIndex={index} />
                </div>
            )}
        </div>
    </div>
}