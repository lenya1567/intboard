import type { User } from "#entities/user";
import { Errors, requestResult, server, type RequestResult } from "#shared";
import type { AxiosError } from "axios";

export type BoardType = {
    id: string;
    name: string;
    description: string;
    author: User;
    isOwner: boolean;
    members: User[];
}

export type CreateBoardForm = {
    name: string;
    description: string;
}

export async function getBoardsList(): RequestResult<BoardType[]> {
    try {
        const response = await server.get("/board/all");
        return requestResult(Errors.NoError, response.data.boards);
    } catch (err) {
        const error = err as AxiosError;
        if (error.status === 400) {
            return requestResult(Errors.FormError);
        }
        if (error.status === 401) {
            return requestResult(Errors.NotAuthorized);
        }
        return requestResult(Errors.ServerError);
    }
}

export async function createBoard(form: CreateBoardForm): RequestResult<string> {
    try {
        const response = await server.post("/board/create", {
            name: form.name,
            description: form.description,
        });
        const boardId = response.data.id;
        const link = `/board/${boardId}`;

        return requestResult(Errors.NoError, link);
    } catch (err) {
        const error = err as AxiosError;
        if (error.status === 400) {
            return requestResult(Errors.FormError);
        }
        if (error.status === 401) {
            return requestResult(Errors.NotAuthorized);
        }
        return requestResult(Errors.ServerError);
    }
}