import { connectWebSocket } from "#shared";
import type { Socket } from "socket.io-client";
import type { BlockDTO, BlockType } from "../api/block";
import { convertBlockDtoToModel } from "../helpers/convertBlockDtoToModel";

interface BoardCallbacks {
    onAllBlocks: ((blocks: BlockType[]) => void);
    onNewBlock: ((block: BlockType) => void);
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
    ws?: Socket;
    blocks?: any[];
    subscribtions: BoardSubscribtionsValue = {
        blockUpdate: {}
    }

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

    initBoard(id: string, callbacks: BoardCallbacks) {
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
    }

    createBlock({ x, y }: { x: number, y: number }) {
        this.ws?.emit("create-block", JSON.stringify({ x, y }))
    }

    updateBlock({ id, action, data }: { id: string, action: BoardAction, data: string }) {
        this.ws?.emit("update-block", JSON.stringify({ id, action, data }));
    }
}