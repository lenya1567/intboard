import classNames from "classnames";
import type { ButtonActionsProps, ClassNameProps } from "#shared";

import styles from "./IconButton.module.css";
import { useCallback, type MouseEvent } from "react";

interface IconButtonProps extends ClassNameProps, ButtonActionsProps {
    icon: string;
    danger?: boolean;
}

export function IconButton({ className, icon, danger, onClick }: IconButtonProps) {
    const onClickFn = useCallback((ev: MouseEvent) => {
        ev.stopPropagation();
        onClick?.(ev);
    }, [onClick]);

    return <img
        className={classNames(styles.button, className, danger && styles.danger)}
        src={icon}
        onMouseDown={onClickFn}
    />
}