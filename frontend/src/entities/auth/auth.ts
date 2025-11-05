import type { AxiosError } from "axios";
import { requestResult, server, type RequestResult } from "#shared";
import { Errors } from "#shared";

export type SignInForm = {
    login: string;
    password: string;
}

export type SignUpForm = {
    displayName: string;
    login: string;
    password: string;
}

export type UserForm = {
    displayName: string;
    login: string;
}

export async function signInUser(form: SignInForm): RequestResult {
    try {
        await server.post("/auth/signin", {
            login: form.login,
            password: form.password
        });
        return requestResult(Errors.NoError);
    } catch (err) {
        const error = err as AxiosError;
        if (error.status === 400) {
            return requestResult(Errors.NoUser);
        }
        return requestResult(Errors.ServerError);
    }
}

export async function signUpUser(form: SignUpForm): RequestResult {
    try {
        await server.post("/auth/signup", {
            displayName: form.displayName,
            login: form.login,
            password: form.password
        });
        return requestResult(Errors.NoError);
    } catch (err) {
        const error = err as AxiosError;
        if (error.status === 400) {
            return requestResult(Errors.LoginBusy);
        }
        return requestResult(Errors.ServerError);
    }
}

export async function signOutUser(): RequestResult {
    try {
        await server.delete("/auth/logout");
        return requestResult(Errors.NoError);
    } catch (err) {
        const error = err as AxiosError;
        if (error.status === 401) {
            return requestResult(Errors.NotAuthorized);
        }
        return requestResult(Errors.ServerError);
    }
}