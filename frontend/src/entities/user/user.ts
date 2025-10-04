import { Errors, requestResult, server, type RequestResult } from "#shared";
import type { AxiosError } from "axios";

export interface User {
    displayName: string;
    login: string;
}

export async function getUser(): RequestResult<User> {
    try {
        const response = await server.get("/auth/me");
        return requestResult(Errors.NoError, response.data);
    } catch (err) {
        const error = err as AxiosError;
        if (error.status === 401) {
            return requestResult(Errors.NotAuthorized);
        }
        return requestResult(Errors.ServerError);
    }
}