import type { BlockType } from "../api/block";

export function getDataWithMeta(newData: string, block: BlockType) {
    return `${block.meta.width}:${block.meta.height}:${block.meta.type}:${newData}`;
}