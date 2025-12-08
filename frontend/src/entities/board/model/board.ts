import { connectWebSocket, Errors, printLogs } from "#shared";
import type { Socket } from "socket.io-client";
import type { BlockDTO, BlockType } from "../api/block";
import { convertBlockDtoToModel } from "../helpers/convertBlockDtoToModel";
import { getBoard, type BoardDescription } from "../api/board";
import { getDataWithMeta } from "../helpers/getDataWithMeta";

interface BoardCallbacks {
    onAllBlocks: ((blocks: BlockType[]) => void);
    onNewBlock: ((block: BlockType) => void);
    onRemoveBlock: ((id: string) => void);
}

interface BoardSubscribtions {
    onUpdateBlock: (blockId: string, callbackType: string, callback: (newBlock: BlockType) => void) => void
}

interface BoardSubscribtionsValue {
    blockUpdate: Record<string, Record<string, (...args: any) => any>>;
}

export const BoardAction = {
    MOVE: "MOVE",
    UPDATE: "UPDATE"
} as const;
type BoardAction = keyof typeof BoardAction;

export class Board {
    id?: string;
    ws?: Socket;
    blocks?: any[];
    subscribtions: BoardSubscribtionsValue = {
        blockUpdate: {}
    };

    description?: BoardDescription;

    subscribe: BoardSubscribtions = {
        onUpdateBlock: (blockId, callbackType, callback) => {
            if (!this.subscribtions.blockUpdate[blockId]) {
                this.subscribtions.blockUpdate[blockId] = {};
            }
            this.subscribtions.blockUpdate[blockId][callbackType] = callback;
        }
    }

    sendMessage(name: "blockUpdate", id: string, ...args: any) {
        Object.values(this.subscribtions[name][id] ?? {}).forEach((callback) => callback(...args));
    }

    async initBoard(id: string, callbacks: BoardCallbacks) {
        const boardDescription = await getBoard(id);
        if (boardDescription.error !== Errors.NoError) {
            printLogs("Получение доски. Ошибка:", boardDescription.error);
            return false;
        }

        this.id = id;
        this.description = boardDescription.data;

        this.ws = connectWebSocket("/board/ws/" + id);

        this.ws.on("error", (...data) => {
            console.error("WS Error!", ...data)
        });

        this.ws.on("all-blocks", (blocks: BlockDTO[]) => {
            callbacks.onAllBlocks(blocks.map((block: BlockDTO) => convertBlockDtoToModel(block)));
        });

        this.ws.on("new-block", (block: BlockDTO) => {
            callbacks.onNewBlock(convertBlockDtoToModel(block));
        });

        this.ws.on("update-block", (block: BlockDTO) => {
            this.sendMessage("blockUpdate", block.id, convertBlockDtoToModel(block));
        });

        this.ws.on("remove-block", (id: string) => {
            callbacks.onRemoveBlock(id);
        });

        return true;
    }

    async updateBoardInformation(newDescription: BoardDescription) {
        this.description = newDescription;
        this.ws?.emit("update-information", JSON.stringify(newDescription));
    }

    createBlock(block: BlockType) {
        this.ws?.emit("create-block", JSON.stringify({
            x: block.position.x,
            y: block.position.y,
            data: getDataWithMeta(block.value!, block)
        }));
    }

    updateBlock({ id, action, data }: { id: string, action: BoardAction, data: string }) {
        this.ws?.emit("update-block", JSON.stringify({ id, action, data }));
    }

    removeBlock({ id }: { id: string }) {
        this.ws?.emit("remove-block", JSON.stringify({ id }));
    }
}