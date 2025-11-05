export type BlockType = {
    id: string;
    position: {
        x: number,
        y: number,
    },
    value: string;
}

export type BlockDTO = {
    id: string;
    x: number;
    y: number;
    data: string;
}

export function createBlock(x: number, y: number): BlockType {
    return {
        id: "",
        position: { x: x - 200, y },
        value: ""
    }
}