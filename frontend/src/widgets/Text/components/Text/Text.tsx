import type { ClassNameProps } from "#shared";
import classNames from "classnames";
import type { PropsWithChildren } from "react";
import styles from './Text.module.css';

type TextProps = ClassNameProps & PropsWithChildren & {
    variant?: 'title' | 'text';
}

export function Text(props: TextProps) {
    return <div className={classNames(styles[props.variant ?? 'text'], props.className)}>
        {props.children}
    </div>
}