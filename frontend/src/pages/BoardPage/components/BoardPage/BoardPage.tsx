import BoardNavbar from "../BoardNavbar/BoardNavbar";
import styles from "./BoardPage.module.css";
import { LoggedInPage } from "#widgets/Page";
import { BoardControls } from "../BoardControls/BoardControls";
import { BoardContent } from "../BoardContent/BoardContent";
import { ControlContextProvider } from "../../model/ControlContext";
import { BoardProvider } from "#entities/board/model/context";

export function BoardPage() {
    return <LoggedInPage noNav color="background">
        <title>Доска</title>
        <BoardProvider>
            <BoardNavbar />
            <ControlContextProvider>
                <div className={styles.content}>
                    <BoardControls />
                    <BoardContent />
                </div>
            </ControlContextProvider>
        </BoardProvider>
    </LoggedInPage>
}