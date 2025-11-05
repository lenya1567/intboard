import type { BlockType } from "#entities/board"
import { useCallback, useContext, useEffect, useMemo, useState, type CSSProperties } from "react";
import styles from "./TextBlock.module.css";
import { BtnBold, BtnBulletList, BtnItalic, BtnUnderline, Editor, EditorProvider, Toolbar, type ContentEditableEvent } from "react-simple-wysiwyg";
import RemoveIcon from "#assets/icons/remove.svg";
import classNames from "classnames";
import { BoardContext } from "../../model/BoardContext";

type TextBlockProps = {
    onMouseDown?: () => {};
    isDrag?: boolean;
    block?: BlockType;
}

export function TextBlock(props: TextBlockProps) {
    const board = useContext(BoardContext);
    const [html, setHTML] = useState(props.block?.value);

    const inlineStyles: CSSProperties = useMemo(() => ({
        minWidth: 400,
        minHeight: 300,
        userSelect: props.isDrag ? "none" : "all",
    }), [props.block, props.isDrag]);

    const updateBlock = useCallback((newBlock: BlockType) => {
        if (newBlock.value !== undefined) {
            setHTML(newBlock.value);
        }
    }, []);

    const updateBlockValue = useCallback((ev: ContentEditableEvent) => {
        board?.updateBlock({
            id: props.block!.id,
            action: "UPDATE",
            data: JSON.stringify({
                newData: ev.target.value
            })
        });
        setHTML(ev.target.value);
    }, [board, setHTML]);

    useEffect(() => {
        board?.subscribe.onUpdateBlock(props.block!.id, "value", updateBlock)
    }, [board, props.block, updateBlock])

    return <div className={styles.block} style={inlineStyles}>
        <div className={styles.blockButton} onMouseDown={props.onMouseDown} />
        {/* <div className={styles.text} contentEditable={!props.isDrag} style={{ userSelect: props.isDrag ? "none" : "all" }}></div> */}
        <EditorProvider>
            <Editor className={styles.text} value={html} onChange={updateBlockValue}>
                <Toolbar>
                    <BtnBold />
                    <BtnItalic />
                    <BtnUnderline />
                    <BtnBulletList />
                    <button className={classNames("rsw-btn", styles.trash)}>
                        <img src={RemoveIcon} />
                    </button>
                </Toolbar>
            </Editor>
        </EditorProvider>
    </div >
}