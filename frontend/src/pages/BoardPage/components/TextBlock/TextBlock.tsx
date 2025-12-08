import type { BlockType } from "#entities/board"
import { useCallback, useContext, useEffect, useMemo, useState, type CSSProperties } from "react";
import styles from "./TextBlock.module.css";
import { BtnBold, BtnBulletList, BtnItalic, BtnUnderline, Editor, EditorProvider, Toolbar, type ContentEditableEvent } from "react-simple-wysiwyg";
import RemoveIcon from "#assets/icons/remove.svg";
import classNames from "classnames";
import { BoardContext } from "#entities/board/model/context";
import { getDataWithMeta } from "#entities/board/helpers/getDataWithMeta";
import { UserContext } from "#app/router/lib/context";

type TextBlockProps = {
    onMouseDown?: () => {};
    isDrag?: boolean;
    block?: BlockType;
}

export function TextBlock(props: TextBlockProps) {
    const board = useContext(BoardContext);
    const user = useContext(UserContext);
    const [html, setHTML] = useState(props.block?.value);
    const [blocked, setBlocked] = useState<string | undefined>("");

    const inlineStyles: CSSProperties = useMemo(() => ({
        minWidth: 400,
        minHeight: 300,
        userSelect: (props.isDrag || blocked) ? "none" : "all",
    }), [props.block, props.isDrag]);

    const updateBlock = useCallback((newBlock: BlockType) => {
        console.log("YES", newBlock)
        setBlocked(newBlock.blockedBy!);
        if (newBlock.value !== undefined) {
            setHTML(newBlock.value);
        }
    }, [setBlocked, setHTML]);

    function reset() {
        console.log(props.block)
        board?.board?.updateBlock({
            id: props.block!.id,
            action: "UPDATE",
            data: JSON.stringify({
                newData: "",
                moving: false
            })
        });
    }

    const updateBlockValue = useCallback((ev: ContentEditableEvent) => {
        window.onclick = reset;
        board?.board?.updateBlock({
            id: props.block!.id,
            action: "UPDATE",
            data: JSON.stringify({
                newData: getDataWithMeta(ev.target.value, props.block!),
                moving: true
            })
        });
        setHTML(ev.target.value);
    }, [props.block, html, board, setHTML]);

    const removeBlock = useCallback(() => {
        board?.board?.removeBlock({ id: props.block!.id });
    }, [board, setHTML]);

    useEffect(() => {
        board?.board?.subscribe.onUpdateBlock(props.block!.id, "value", updateBlock)
    }, [board, props.block, updateBlock])

    return <div className={styles.block} style={inlineStyles}>
        <div className={styles.blockButton} onMouseDown={!blocked ? props.onMouseDown : () => { }} />
        {(blocked && user.user?.displayName !== blocked) && <div className={styles.blocked}>Редактирует <b>{blocked}</b></div>}
        <EditorProvider>
            <Editor style={{ userSelect: "none" }} value={html} className={styles.text} onChange={updateBlockValue} onClick={(ev) => ev.preventDefault()}>
                <Toolbar>
                    <BtnBold />
                    <BtnItalic />
                    <BtnUnderline />
                    <BtnBulletList />
                    <button className={classNames("rsw-btn", styles.trash)} onClick={removeBlock}>
                        <img src={RemoveIcon} />
                    </button>
                </Toolbar>
            </Editor>
        </EditorProvider>
    </div >
}