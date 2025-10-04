import { useCallback, type FocusEvent, type KeyboardEvent } from "react";
import styles from "./BoardNavbar.module.css";

export default function BoardNavbar() {
    const saveBoardName = useCallback((event: FocusEvent<HTMLDivElement>) => {
        console.log(event.currentTarget.innerText)
    }, []);

    const boardEditFinished = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "Enter") {
            event.preventDefault();
            event.currentTarget.blur();
        }
    }, []);

    return <div className={styles.nav}>
        <div className={styles.boardName} contentEditable onBlur={saveBoardName} onKeyDown={boardEditFinished}>
        </div>
    </div>
}