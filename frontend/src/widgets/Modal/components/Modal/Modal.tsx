import { useCallback, useEffect, useState, type PropsWithChildren } from "react";
import styles from './Modal.module.css';
import classNames from "classnames";

export type ModalProps = PropsWithChildren & {
    opened?: boolean;
    ignoreTintClose?: boolean;
    onClose?: () => void;
}

export function Modal(props: ModalProps) {
    const [modalState, setModalState] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (!props.opened) {
            if (modalState) setModalState(styles.closed);
        } else {
            setModalState(styles.opened);
        }
    }, [props.opened]);

    const handleClose = useCallback(() => {
        if (!props.ignoreTintClose) {
            props.onClose?.();
        }
    }, [])

    return (
        <div className={classNames(styles.modal, props.opened && styles.opened, modalState)}>
            <div className={styles.tint} onClick={handleClose} />
            <div className={styles.content}>
                {props.children}
            </div>
        </div>
    )
}