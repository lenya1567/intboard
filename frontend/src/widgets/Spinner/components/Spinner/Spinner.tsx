import styles from "./Spinner.module.css";

export function Spinner() {
    return <svg className={styles.spinner} width={32} height={32} viewBox="0 0 32 32">
        <circle cx={16} cy={16} r={13.5} strokeWidth={3} fill="none" />
    </svg>
}