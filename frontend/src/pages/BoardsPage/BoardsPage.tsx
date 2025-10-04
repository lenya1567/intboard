import { Page } from "#widgets";
import styles from "./BoardsPage.module.css";
import { BoardsList } from "./components/BoardsList/BoardsList";

export function BoardsPage() {
    return <Page color="background">
        <div className={styles.content}>
            <div className={styles.header}>Доски</div>
            <BoardsList />
        </div>
    </Page>
}