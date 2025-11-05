import type { ButtonActionsProps, ClassNameProps } from "#shared";
import classNames from "classnames";
import styles from './Button.module.css';
import { useCallback, useContext, type MouseEvent } from "react";
import { FormContext } from "#widgets/Form";

type ButtonProps = ButtonActionsProps & ClassNameProps & {
    title: string;
    href?: string;
    fullsize?: boolean;
    outlined?: boolean;
    asSubmit?: boolean;
}

export function Button(props: ButtonProps) {
    const formContext = useContext(FormContext);

    const handleClick = useCallback((ev: MouseEvent) => {
        if (formContext && props.asSubmit) {
            formContext.onSubmit();
        }
        props.onClick?.(ev);
    }, [formContext, formContext.onSubmit]);

    return <button
        className={classNames(
            styles.button,
            (props.fullsize && !props.href) && styles.fullsize,
            (props.outlined && !props.href) && styles.outlined,
            props.href && styles.href,
            props.className
        )}
        onClick={handleClick}
    >
        {props.title}
    </button>
}