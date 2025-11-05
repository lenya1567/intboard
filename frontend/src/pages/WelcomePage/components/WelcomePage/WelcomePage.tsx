import { useContext, useEffect } from "react";
import styles from './WelcomePage.module.css';
import { Link, useNavigate } from "react-router-dom";
import WelcomeImage from "../../assets/welcome.svg";
import { Button } from "#widgets/Button/index.ts";
import { StartPage } from "#widgets/Page/index.ts";
import { UserContext } from "#app/router/lib/context";

export function WelcomePage() {
    const user = useContext(UserContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (user.loggedIn) {
            navigate("/boards");
        }
    }, [user]);

    return (
        <StartPage color="background">
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
        </StartPage>
    )
}