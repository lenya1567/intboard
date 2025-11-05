import { cloneElement, useContext, useEffect, useRef, useState, type MouseEvent, type ReactElement } from "react";
import styles from "./DragBlock.module.css";
import { DragContext, type PositionProps } from "#app/router/lib/context";
import type { BlockType } from "#entities/board";
import { BoardContext } from "../../model/BoardContext";

interface DragBlockProps {
    block: BlockType,
    children: ReactElement<{
        block: BlockType,
        isDrag: boolean,
        onMouseDown: (event: MouseEvent<HTMLElement>) => void,
    }>
}

interface DragParams {
    top: number;
    left: number;
    dx: number;
    dy: number;
    drag: boolean;
}

export function DragBlock({ block, children }: DragBlockProps) {
    const board = useContext(BoardContext);

    const dragContext = useContext(DragContext);
    const position = useRef<DragParams>({
        top: block.position.y,
        left: block.position.x,
        dx: 0,
        dy: 0,
        drag: false,
    });

    const boardRef = useRef<HTMLDivElement>(null);
    const lastTimeSend = useRef(0);

    const [dragStarted, setDragStarted] = useState(false);

    function updateStyles(newPosition: DragParams | ((prev: DragParams) => DragParams)) {
        position.current = typeof newPosition === 'function' ? newPosition(position.current) : newPosition;
        boardRef.current!.style.top = `${position.current.top + position.current.dy}px`;
        boardRef.current!.style.left = `${position.current.left + position.current.dx}px`;
    }

    function dragMove(ctx: PositionProps, event: MouseEvent<HTMLElement>) {
        const deltaX = event.clientX - ctx.x;
        const deltaY = event.clientY - ctx.y;

        updateStyles(prev => ({
            ...prev,
            dx: deltaX,
            dy: deltaY,
            drag: true,
        }))

        if (Date.now() - lastTimeSend.current > 10) {
            lastTimeSend.current = Date.now();
            board?.updateBlock({
                id: block.id,
                action: "MOVE",
                data: JSON.stringify({
                    x: position.current.left + position.current.dx,
                    y: position.current.top + position.current.dy,
                    moving: true
                })
            });
        }
    }

    function dragEnd(ctx: PositionProps, event: MouseEvent<HTMLElement>) {
        const deltaX = event.clientX - ctx.x;
        const deltaY = event.clientY - ctx.y;

        updateStyles(prev => ({
            left: prev.left + deltaX,
            top: prev.top + deltaY,
            dx: 0,
            dy: 0,
            drag: false,
        }));

        board?.updateBlock({
            id: block.id,
            action: "MOVE",
            data: JSON.stringify({
                x: position.current.left + position.current.dx,
                y: position.current.top + position.current.dy,
                moving: false
            })
        });

        setDragStarted(false);
    }

    function dragStart(event: MouseEvent<HTMLElement>) {
        dragContext!.onStart?.(event, dragMove, dragEnd);
        updateStyles(prev => ({
            ...prev,
            drag: true,
        }));
        setDragStarted(true);
    }

    function updateBlock(newBlock: BlockType) {
        block.position = newBlock.position;
        updateStyles(prev => ({
            ...prev,
            left: newBlock.position.x,
            top: newBlock.position.y
        }))
    }

    useEffect(() => updateStyles(position.current), [])

    useEffect(() => {
        board?.subscribe.onUpdateBlock(block.id, "position", updateBlock)
    }, [board, block, updateBlock])

    return <div
        className={styles.dragBlock}
        ref={boardRef}
    >
        {cloneElement(children, {
            block,
            isDrag: dragStarted,
            onMouseDown: dragStart
        })}
    </div>
}