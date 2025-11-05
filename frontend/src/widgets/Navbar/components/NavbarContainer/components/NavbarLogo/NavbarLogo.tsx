import { Logo } from "../../../Logo/Logo"
import styles from "./NavbarLogo.module.css";

export function NavbarLogo() {
    return <div className={styles.logo}>
        <Logo />
    </div>
}