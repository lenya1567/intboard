import { uploadFile, type BlockType } from "#entities/board"
import { useCallback, useContext, useEffect, useMemo, useState, type CSSProperties } from "react";
import styles from "./ImageBlock.module.css";
import RemoveIcon from "#assets/icons/remove.svg";
import EditIcon from "#assets/icons/edit.svg";
import classNames from "classnames";
import { BoardContext } from "#entities/board/model/context";
import { getDataWithMeta } from "#entities/board/helpers/getDataWithMeta";
import { Errors } from "#shared";
import { UserContext } from "#app/router/lib/context";

type ImageBlockProps = {
    onMouseDown?: () => {};
    isDrag?: boolean;
    block?: BlockType;
}

export function ImageBlock(props: ImageBlockProps) {
    const board = useContext(BoardContext);
    const user = useContext(UserContext);
    const [url, setUrl] = useState(props.block?.value);
    const [blocked, setBlocked] = useState<string | undefined>("");

    const inlineStyles: CSSProperties = useMemo(() => ({
        minWidth: 400,
        userSelect: props.isDrag ? "none" : "all",
    }), [props.block, props.isDrag]);

    const updateBlock = useCallback((newBlock: BlockType) => {
        setBlocked(newBlock.blockedBy!);
        if (newBlock.value !== undefined) {
            setUrl(newBlock.value);
        }
    }, [setBlocked, setUrl]);

    const onUploadFile = useCallback(async (ev: any) => {
        const formData = new FormData();
        formData.set("image", ev.target.files[0]);
        const { error, data: link } = await uploadFile(formData);
        if (error === Errors.NoError) {
            board?.board?.updateBlock({
                id: props.block?.id!,
                action: "UPDATE",
                data: JSON.stringify({
                    newData: getDataWithMeta(link!, props.block!)
                })
            });
            setUrl(link);
        }
    }, [board, setUrl]);

    const removeBlock = useCallback(() => {
        board?.board?.removeBlock({ id: props.block!.id });
    }, [board, setUrl]);

    useEffect(() => {
        board?.board?.subscribe.onUpdateBlock(props.block!.id, "value", updateBlock)
    }, [board, props.block, updateBlock])

    return <div className={styles.block} style={inlineStyles}>
        {(blocked && user.user?.displayName !== blocked) && <div className={styles.blocked}>Редактирует <b>{blocked}</b></div>}
        <div className={classNames(styles.controls, "rsw-toolbar")}>
            <div style={{ display: "flex", position: "relative" }}>
                <label htmlFor={"file_" + props.block?.id} className={classNames("rsw-btn")}>
                    <img src={EditIcon} />
                </label>
                <input type="file" id={"file_" + props.block?.id} style={{ display: "none", zIndex: -1 }} onChange={onUploadFile} />
            </div>
            <button className={classNames("rsw-btn", styles.trash)} onClick={removeBlock}>
                <img src={RemoveIcon} />
            </button>
        </div>
        <div className={styles.blockButton} onMouseDown={!blocked ? props.onMouseDown : () => { }} />
        <img className={styles.image} src={url} />
    </div >
}