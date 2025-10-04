import { Errors } from "#shared";

export type BoardType = {
    id: string;
    name: string;
    owner: boolean;
}

export function getBoardsList(): Promise<{ error: Errors, boards?: BoardType[] }> {
    const boards = Array(20).fill(0).map((_, index) => ({
        id: `ID_${index}`,
        name: `Доска #${index + 1}`,
        owner: index % 4 === 0
    }));
    return Promise.resolve({
        error: Errors.NoError,
        boards,
    })
}