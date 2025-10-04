import type { PropsWithChildren } from "react";
import styles from "./InformationBlock.module.css";
import type { ClassNameProps } from "#shared";
import classNames from "classnames";

export function InformationBlock(props: PropsWithChildren & ClassNameProps) {
    return <div className={classNames(styles.block, props.className)}>
        {props.children}
    </div>
}