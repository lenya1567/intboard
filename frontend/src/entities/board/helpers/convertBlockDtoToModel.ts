import type { BlockDTO, BlockType } from "../api/block";

export function convertBlockDtoToModel(dto: BlockDTO): BlockType {
    if (!dto.data) {
        return {
            id: dto.id,
            position: {
                x: dto.x,
                y: dto.y
            },
            meta: {
                width: 0,
                height: 0,
                type: "",
            },
            value: undefined,
            blockedBy: dto.blocked
        }
    }

    const dataSplit = dto.data.split(":");
    const width = parseInt(dataSplit[0]);
    const height = parseInt(dataSplit[1]);
    const type = dataSplit[2];
    const data = dataSplit.slice(3).join(":");

    return {
        id: dto.id,
        position: {
            x: dto.x,
            y: dto.y
        },
        meta: {
            width,
            height,
            type,
        },
        value: data,
        blockedBy: dto.blocked
    }
}