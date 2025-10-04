import type { BoardType } from "#entities";
import styles from "./BoardsListItem.module.css";

export function BoardsListItem({ board }: { board: BoardType }) {
    return <div className={styles.item}>
        <div className={styles.body}>
            <div className={styles.name}>{board.name}</div>
            <div className={styles.last}>Последнее изменение: 14:13 20.05.2005</div>
        </div>
        <div className={styles.authors}>
        </div>
    </div>
}