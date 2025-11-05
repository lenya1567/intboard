import { Button } from "#widgets/Button";
import { Modal } from "#widgets/Modal";

import styles from "./SignOutModal.module.css";

type SignOutModalProps = {
    opened: boolean;
    onSuccess: () => void;
    onClose: () => void;
}

export function SignOutModal({ opened, onSuccess, onClose }: SignOutModalProps) {
    return <Modal className={styles.modal} opened={opened} onClose={onClose}>
        <div className={styles.description}>
            Вы уверены, что хотите выйти?
        </div>
        <div className={styles.actions}>
            <Button outlined title="Отмена" onClick={onClose} />
            <Button title="Выйти из профиля" onClick={onSuccess} />
        </div>
    </Modal>
}