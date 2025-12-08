import { createContext, useEffect, useMemo, useRef, useState, type PropsWithChildren } from "react";
import { Board } from "./board";
import { useNavigate, useParams } from "react-router-dom";
import type { BlockType } from "../api/block";

interface BoardContextValue {
    board: Board | null;
    blocks: BlockType[];
}

export const BoardContext = createContext<BoardContextValue | null>(null);

export function BoardProvider(props: PropsWithChildren) {
    const [board, setBoard] = useState<Board | null>(null);
    const [blocks, setBlocks] = useState<BlockType[]>([]);
    const navigate = useNavigate();
    const params = useParams();
    const started = useRef(false);

    useEffect(() => {
        if (!started.current) {
            started.current = true;
            const newBoard = new Board();
            newBoard.initBoard(params.id ?? "", {
                onAllBlocks: setBlocks,
                onNewBlock: (block) => setBlocks(prev => [...prev, block]),
                onRemoveBlock: (id) => {
                    console.log(id);
                    setBlocks(prev => prev.filter((E) => E.id !== id))
                }
            }).then((isOk) => {
                if (isOk) {
                    setBoard(newBoard);
                } else {
                    navigate("/");
                }
            });
        }
    }, [setBoard, setBlocks]);

    const value = useMemo(() => ({
        board, blocks
    }), [board, blocks]);

    return <BoardContext.Provider value={value}>
        {props.children}
    </BoardContext.Provider>
}