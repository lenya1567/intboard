import { Button, Page } from "#widgets";
import { useEffect, useState } from "react";
import styles from './WelcomePage.module.css';
import { getBoardsList, type BoardType } from "#entities";
import { Errors } from "#shared";
import { Link } from "react-router-dom";
import WelcomeImage from "./assets/welcome.svg";
import { Spinner } from "../../widgets/Spinner/Spinner";

export function WelcomePage() {
    const [boards, setBoards] = useState<BoardType[]>([]);
    const [modalsOpen, setModalsOpen] = useState(null);

    useEffect(() => {
        getBoardsList().then((boardsList) => {
            if (boardsList.error === Errors.NoError) {
                setBoards(boardsList.boards!);
            }
        });
    }, []);

    return (
        <Page color="background">
            <div className={styles.content}>
                <div className={styles.overview}>
                    Создайте&#32;
                    <Link to='new_board' className={styles.link}>Интерактивную&nbsp;доску</Link>,<br />
                    чтобы показывать и обсуждать свои идеи в команде!
                    <div className={styles.action}>
                        <Button title="Создать доску" />
                        <Button outlined title="Присоединится к команде" />
                    </div>
                </div>
                <div className={styles.present}>
                    <img className={styles.overviewImage} src={WelcomeImage} />
                </div>
            </div>
        </Page>
    )
}