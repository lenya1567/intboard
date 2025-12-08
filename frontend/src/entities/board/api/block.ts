export type BlockType = {
    id: string;
    position: {
        x: number,
        y: number,
    },
    meta: {
        width: number,
        height: number,
        type: string,
    },
    blockedBy?: string,
    value?: string;
}

export type BlockDTO = {
    id: string;
    x: number;
    y: number;
    data: string;
    blocked: string;
}

export function createBlock(x: number, y: number, type: string): BlockType {
    return {
        id: "",
        position: { x: x - 200, y },
        value: "",
        meta: {
            width: 400,
            height: 300,
            type,
        }
    }
}