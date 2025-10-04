import { useContext, useMemo, useState, type MouseEvent } from "react";
import styles from "./BoardBlock.module.css";
import classNames from "classnames";
import { IconButton } from "#widgets";

import EditIcon from "#assets/icons/edit.svg";
import RemoveIcon from "#assets/icons/remove.svg";
import { TextBlock } from "../TextBlock/TextBlock";
import { BoardDragElement } from "../BoardDragElement/BoardDragElement";
import { DragContext, type PositionProps } from "#app";

export default function BoardBlock() {
    const dragContext = useContext(DragContext);
    const [position, setPosition] = useState({
        top: 200,
        left: 100,
        dx: 0,
        dy: 0,
        drag: false,
    })

    function dragMove(ctx: PositionProps, event: MouseEvent<HTMLElement>) {
        const deltaX = event.clientX - ctx.x;
        const deltaY = event.clientY - ctx.y;

        setPosition(prev => ({
            ...prev,
            dx: deltaX,
            dy: deltaY,
            drag: true,
        }))
    }

    function dragEnd(ctx: PositionProps, event: MouseEvent<HTMLElement>) {
        const deltaX = event.clientX - ctx.x;
        const deltaY = event.clientY - ctx.y;

        setPosition({
            left: position.left + deltaX,
            top: position.top + deltaY,
            dx: 0,
            dy: 0,
            drag: false,
        });
    }

    function dragStart(event: MouseEvent<HTMLElement>) {
        dragContext!.onStart?.(event, dragMove, dragEnd);
        setPosition(prev => ({
            ...prev,
            drag: true,
        }))
    }

    const style = useMemo(() => ({
        top: position.top + position.dy,
        left: position.left + position.dx,
    }), [position]);

    return <div
        className={classNames(styles.block, position.drag && styles.blockActive)}
        style={style}
    >
        <BoardDragElement onDrag={dragStart} />
        <TextBlock />
        <div className={styles.actions}>
            <IconButton icon={RemoveIcon} danger />
            <IconButton icon={EditIcon} onClick={(ev) => {
                console.log("YES")
            }} />
        </div>
    </div>
}