import { useContext } from "react";
import BoardBlock from "./components/BoardBlock/BoardBlock";
import BoardNavbar from "./components/BoardNavbar/BoardNavbar";
import styles from "./BoardPage.module.css";
import { DragContext } from "#app";

export function BoardPage() {
    const dragContext = useContext(DragContext);

    return <div {...dragContext.events} className={styles.board}>
        <BoardNavbar />
        <div className={styles.background}>
            <BoardBlock />
        </div>
    </div>
}