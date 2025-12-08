import { cloneElement, useContext, useEffect, useRef, useState, type MouseEvent, type ReactElement } from "react";
import styles from "./DragBlock.module.css";
import { DragContext, type PositionProps } from "#app/router/lib/context";
import type { BlockType } from "#entities/board";
import { BoardContext } from "#entities/board/model/context";

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

    const blockRef = useRef<HTMLDivElement>(null);
    const blockPlaceholderRef = useRef<HTMLDivElement>(null);
    const lastTimeSend = useRef(0);

    const [dragStarted, setDragStarted] = useState(false);

    function updateStyles(newPosition: DragParams | ((prev: DragParams) => DragParams)) {
        position.current = typeof newPosition === 'function' ? newPosition(position.current) : newPosition;
        const [posX, posY] = [position.current.left + position.current.dx, position.current.top + position.current.dy];

        const block = blockRef.current!.children[0] as HTMLDivElement;
        const rect = block.getBoundingClientRect();

        if (!position.current.drag) {
            blockPlaceholderRef.current!.style.transition = "width 1s, height 1s";
        } else {
            blockPlaceholderRef.current!.style.transition = "";
        }

        blockPlaceholderRef.current!.style.width = rect.width + 64 - Math.min(position.current.dx, 0) + "px";
        blockPlaceholderRef.current!.style.height = rect.height + 64 - Math.min(position.current.dy, 0) + "px";

        blockRef.current!.style.top = `${posY}px`;
        blockRef.current!.style.left = `${posX}px`;

        blockPlaceholderRef.current!.style.top = `${posY}px`;
        blockPlaceholderRef.current!.style.left = `${posX}px`;
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
            board?.board?.updateBlock({
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

        board?.board?.updateBlock({
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
        board?.board?.subscribe.onUpdateBlock(block.id, "position", updateBlock)
    }, [board, block, updateBlock])

    return <>
        <div
            className={styles.dragBlock}
            ref={blockRef}
        >
            {cloneElement(children, {
                block,
                isDrag: dragStarted,
                onMouseDown: dragStart
            })}
        </div>
        <div ref={blockPlaceholderRef} className={styles.dragBlockPlaceholder} />
    </>
}