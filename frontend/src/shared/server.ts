import axios from "axios";
import type { Errors } from "./errors";

export const server = axios.create({
    baseURL: `${location.origin}/api`,
});

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