import { useCallback, useContext, useMemo, type CSSProperties, type MouseEvent } from "react";
import styles from "./BoardContent.module.css";
import { ControlContext } from "../../model/ControlContext";
import { createBlock } from "#entities/board";
import { TextBlock } from "../TextBlock/TextBlock";
import { DragBlock } from "../DragBlock/DragBlock";
import { DragContext } from "#app/router/lib/context";
import { BoardContext } from "#entities/board/model/context";
import { useSearchParams } from "react-router-dom";
import { ImageBlock } from "../ImageBlock/ImageBlock";

export function BoardContent() {
    const dragContext = useContext(DragContext);
    const controlContext = useContext(ControlContext);
    const board = useContext(BoardContext);
    const [searchParams, setSearchParams] = useSearchParams();

    const onClickHandle = useCallback((event: MouseEvent<HTMLDivElement>) => {
        if (controlContext.controls.nowAction) {
            const [posX, posY] = [event.clientX + dragContext.boardRef?.current?.scrollLeft!, event.clientY + dragContext.boardRef?.current?.scrollTop!]
            if (controlContext.controls.nowAction === "addBlock") {
                const newBlock = createBlock(posX, posY, "text");
                board?.board?.createBlock(newBlock);
            }
            if (controlContext.controls.nowAction === "addImage") {
                searchParams.set("x", `${posX}`)
                searchParams.set("y", `${posY}`)
                searchParams.set("new-image", "true");
                setSearchParams(searchParams);
            }
            controlContext.actions.setControls(null);
        }
    }, [controlContext, searchParams, setSearchParams]);

    const inlineStyles: CSSProperties = useMemo(() => ({
        cursor: controlContext.controls.nowAction !== null ? 'copy' : undefined
    }), [controlContext]);

    return <div ref={dragContext?.boardRef} className={styles.content} style={inlineStyles} onClick={onClickHandle} {...dragContext.events}>
        {board?.blocks?.map((block) =>
            <DragBlock key={block.id} block={block}>
                {block.meta.type === "text"
                    ? <TextBlock />
                    : <ImageBlock />
                }
            </DragBlock>
        )}
    </div>
}