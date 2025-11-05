import axios from "axios";
import { io } from "socket.io-client";
import type { Errors } from "./errors";

type RequestResultData<T = undefined> = {
    error: Errors;
    data?: T;
};
export type RequestResult<T = undefined> = Promise<RequestResultData<T>>;

export function requestResult<T = undefined>(error: Errors, data?: T): RequestResultData<T> {
    return {
        error,
        data
    }
}

export const server = axios.create({
    baseURL: `${location.origin}/api`,
});

export function connectWebSocket(path: string) {
    return io(`${location.origin}`, { path: `/api${path}` })
}