import classNames from "classnames";
import styles from "./NavbarItem.module.css";
import type { ButtonActionsProps, ClassNameProps } from "#shared";
import { Link } from "react-router-dom";

export type NavbarItemProps = ClassNameProps & ButtonActionsProps & {
    title: string;
    caption?: string;
    img?: string;
    danger?: boolean;
    to?: string;
}

export function NavbarItem({ to, className, title, caption, img, danger, onClick }: NavbarItemProps) {
    return !to
        ? <div className={classNames(styles.item, danger && styles.danger, className)} onClick={onClick}>
            {caption && <div className={styles.caption}>
                {caption}
            </div>}
            <div className={styles.title}>
                {img && <img src={img} />}
                {title}
            </div>
        </div>
        : <Link to={to} className={styles.reset}>
            <div className={classNames(styles.item, danger && styles.danger, className)} onClick={onClick}>
                {caption && <div className={styles.caption}>
                    {caption}
                </div>}
                <div className={styles.title}>
                    {img && <img src={img} />}
                    {title}
                </div>
            </div>
        </Link>
}