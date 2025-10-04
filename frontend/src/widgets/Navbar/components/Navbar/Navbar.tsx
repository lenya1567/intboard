import { LoginModal } from "../LoginModal/LoginModal";
import { SignUpModal } from "../SignUpModal/SignUpModal";
import { Button } from "#widgets/Button";
import { Logo } from "../Logo/Logo";
import styles from "./Navbar.module.css";
import { Link, useSearchParams } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "#app";

export function Navbar() {
    const [_, setQuery] = useSearchParams();
    const user = useContext(UserContext);

    return <>
        <LoginModal />
        <SignUpModal />
        <div className={styles.nav}>

            <Logo />
            <div className={styles.navItems}>
                {user.loggedIn && <Link to="boards">Мои Доски</Link>}
            </div>
            {user.loggedIn
                ? <Link to="/href">
                    <Button title="Профиль" />
                </Link>
                : <Button title="Войти" onClick={() => setQuery({ login: "true" })} />
            }
        </div>
    </>
}