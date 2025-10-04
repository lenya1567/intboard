import type { PropsWithChildren } from "react";
import styles from "./StartPage.module.css";
import type { ColorProps } from "#shared";
import classNames from "classnames";
import { Navbar } from "#widgets/Navbar";

type PageProps = PropsWithChildren & ColorProps & {
    centered?: boolean;
    noNav?: boolean;
}

export function StartPage({ color, children, centered, noNav }: PageProps) {
    return <div className={
        classNames(
            styles.page,
            color && styles[`color-${color}`],
            centered && styles['align-center']
        )
    }>
        <div className={styles.content}>
            {!noNav && <Navbar />}
            {children}
        </div>
    </div>
}