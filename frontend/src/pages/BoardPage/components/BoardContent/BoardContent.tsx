import { useCallback, useContext, useEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import styles from "./BoardContent.module.css";
import { ControlContext } from "../../model/ControlContext";
import { Board, createBlock, type BlockType } from "#entities/board";
import { TextBlock } from "../TextBlock/TextBlock";
import { DragBlock } from "../DragBlock/DragBlock";
import { DragContext } from "#app/router/lib/context";
import { useParams } from "react-router-dom";
import { BoardContext } from "../../model/BoardContext";

export function BoardContent() {
    const dragContext = useContext(DragContext);
    const controlContext = useContext(ControlContext);
    const params = useParams();
    const [blocks, setBlocks] = useState<BlockType[]>([]);
    const [board, setBoard] = useState<Board | null>(null);
    const started = useRef(false);

    useEffect(() => {
        if (!started.current) {
            const newBoard = new Board();
            newBoard.initBoard(params.id ?? "", {
                onAllBlocks: setBlocks,
                onNewBlock: (block) => setBlocks(prev => [...prev, block])
            });
            setBoard(newBoard);
            started.current = true;
        }
    }, [setBoard, setBlocks]);

    const onClickHandle = useCallback((event: MouseEvent<HTMLDivElement>) => {
        if (controlContext.controls.nowAction) {
            const newBlock = createBlock(event.clientX, event.clientY);
            board?.createBlock({ x: newBlock.position.x, y: newBlock.position.y });
            controlContext.actions.setControls(null);
        }
    }, [controlContext, setBlocks]);

    const inlineStyles: CSSProperties = useMemo(() => ({
        cursor: controlContext.controls.nowAction !== null ? 'copy' : undefined
    }), [controlContext]);

    return <BoardContext.Provider value={board}>
        <div className={styles.content} style={inlineStyles} onClick={onClickHandle} {...dragContext.events}>
            {blocks.map((block) =>
                <DragBlock block={block}>
                    <TextBlock />
                </DragBlock>
            )}
        </div>
    </BoardContext.Provider>
}