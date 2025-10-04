import styles from "./Logo.module.css";
import LogoImg from "#assets/icons/logo.png";

export function Logo() {
    return <div className={styles.logo}>
        <img className={styles.img} src={LogoImg} />
        <div className={styles.name}>INBOARD</div>
    </div>
}