import { useSearchParams } from "react-router-dom";
import styles from './LoginModal.module.css';
import { useCallback, useContext } from "react";
import { Errors, ValidationType } from "#shared";
import { signInUser } from "#entities/auth";
import { Modal } from "#widgets/Modal";
import { Form } from "#widgets/Form";
import { TextField } from "#widgets/TextField";
import { Button } from "#widgets/Button";
import { UserContext } from "#app/router/lib/context";

export function LoginModal({ important }: { important?: boolean }) {
    const [params, setParams] = useSearchParams();
    const user = useContext(UserContext);

    const handleSignIn = useCallback(async (form: Record<string, string>) => {
        const { error } = await signInUser({
            login: form.username,
            password: form['current-password'],
        });

        switch (error) {
            case Errors.NoError:
                setParams({});
                user.resetUser();
                return;
            case Errors.NoUser:
                return { username: "Неверный логин или пароль" }
            case Errors.ServerError:
                return { 'current-password': "Ошибка сервера, повторите попытку позже" };
        }
    }, []);

    const handleRegister = useCallback(() => setParams({ register: "true" }), [setParams]);
    const handleClose = useCallback(() => setParams({}), [setParams]);

    return (
        <Modal opened={params.has("login")} onClose={handleClose} ignoreTintClose={important}>
            <h1 className={styles.header}>Вход в аккаунт</h1>
            <Form className={styles.form} onSubmit={handleSignIn}>
                <TextField
                    name="username"
                    title="Логин:"
                    validation={ValidationType.NotEmpty}
                    message="Логин не должен быть пустым"
                />
                <TextField
                    name="current-password"
                    title="Пароль:"
                    validation={ValidationType.Password}
                    message="Пароль не должен быть пустым"
                />
                <div className={styles.actions}>
                    <Button title="Войти" asSubmit />
                    <Button title="Нет аккаунта" outlined onClick={handleRegister} />
                </div>
            </Form>
        </Modal>
    )
}