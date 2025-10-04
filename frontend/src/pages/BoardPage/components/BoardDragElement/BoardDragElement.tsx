import type { MouseEvent } from "react";
import styles from "./BoardDragElement.module.css";

interface BoardDragElementProps {
    onDrag: (ev: MouseEvent<HTMLElement>) => void;
}

export function BoardDragElement({ onDrag }: BoardDragElementProps) {
    return <div className={styles.dragElement} onMouseDown={onDrag} />
}