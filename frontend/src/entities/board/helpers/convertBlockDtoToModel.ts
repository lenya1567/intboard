import type { BlockDTO, BlockType } from "../api/block";

export function convertBlockDtoToModel(dto: BlockDTO): BlockType {
    return {
        id: dto.id,
        position: {
            x: dto.x,
            y: dto.y
        },
        value: dto.data
    }
}