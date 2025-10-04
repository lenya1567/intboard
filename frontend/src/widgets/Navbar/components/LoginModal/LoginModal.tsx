import { Button, Form, Modal, TextField } from "#widgets";
import { useSearchParams } from "react-router-dom";
import styles from './LoginModal.module.css';
import { useCallback } from "react";
import { Errors, ValidationType } from "#shared";
import { signInUser } from "#entities";

export function LoginModal() {
    const [params, setParams] = useSearchParams();

    const handleSignIn = useCallback(async (form: Record<string, string>) => {
        const { error } = await signInUser({
            login: form.login,
            password: form.password,
        });

        switch (error) {
            case Errors.NoError:
                setParams({});
                return;
            case Errors.NoUser:
                return { login: "Неверный логин или пароль" }
            case Errors.ServerError:
                return { password: "Ошибка сервера, повторите попытку позже" };
        }
    }, []);

    const handleRegister = useCallback(() => setParams({ register: "true" }), [setParams]);
    const handleClose = useCallback(() => setParams({}), [setParams]);

    return (
        <Modal opened={params.has("login")} onClose={handleClose}>
            <h1 className={styles.header}>Вход в аккаунт</h1>
            <Form className={styles.form} onSubmit={handleSignIn}>
                <TextField
                    name="login"
                    title="Логин:"
                    validation={ValidationType.NotEmpty}
                    message="Логин не должен быть пустым"
                />
                <TextField
                    name="password"
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