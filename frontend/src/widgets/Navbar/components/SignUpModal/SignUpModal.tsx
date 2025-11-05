import { Errors, ValidationType } from "#shared";
import { Form } from "#widgets/Form";
import { useCallback, useContext } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "../../../Button";
import { TextField } from "../../../TextField";
import styles from './SignUpModal.module.css';
import { Modal } from "#widgets/Modal";
import { signUpUser } from "#entities/auth";
import { UserContext } from "#app/router/lib/context";


export function SignUpModal({ important }: { important?: boolean }) {
    const [params, setParams] = useSearchParams();
    const user = useContext(UserContext);

    const handleSignUp = useCallback(async (form: Record<string, string>) => {
        if (form.password !== form.repeatPassword) {
            return { repeatPassword: "Пароли не совпадают" }
        }

        const { error } = await signUpUser({
            displayName: form.displayName,
            login: form.login,
            password: form.password,
        });

        switch (error) {
            case (Errors.NoError):
                setParams({});
                user.resetUser();
                return;
            case (Errors.LoginBusy):
                return { login: "Данный логин уже занят" };
            case (Errors.ServerError):
                return { password: "Ошибка сервера, повторите попытку позже" };
        }
    }, []);

    const handleLogin = useCallback(() => setParams({ login: "true" }), [setParams])
    const handleClose = useCallback(() => setParams({}), [setParams])

    return (
        <Modal opened={!params.has("login") && params.has("register")} onClose={handleClose} ignoreTintClose={important}>
            <h1 className={styles.header}>Регистрация</h1>
            <Form className={styles.form} onSubmit={handleSignUp}>
                <TextField
                    name="displayName"
                    title="Как к вам обращаться:"
                    validation={ValidationType.NotEmpty}
                    message="Имя не должно быть пустым"
                />
                <TextField
                    name="login"
                    title="Логин:"
                    validation={ValidationType.NotEmpty}
                    message="Логин не должен быть пустым"
                />
                <TextField
                    name="password"
                    title="Пароль:"
                    validation={ValidationType.NewPassword}
                    message="Пароль должен содержать как минимум 8 символов"
                />
                <TextField
                    name="repeatPassword"
                    title="Повторите пароль:"
                    validation={ValidationType.Password}
                />
                <div className={styles.actions}>
                    <Button title="Присоединиться к INBOARD" asSubmit />
                    <Button title="Уже есть аккаунт" outlined onClick={handleLogin} />
                </div>
            </Form>
        </Modal>
    )
}
