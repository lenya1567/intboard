import styles from "./TextEditBlock.module.css";

import BoldIcon from "#assets/icons/font/bold.svg";
import ItalicIcon from "#assets/icons/font/italic.svg";
import UnderlineIcon from "#assets/icons/font/underline.svg";
import CodeIcon from "#assets/icons/font/code.svg";
import { useEffect, useState, type MouseEvent, type RefObject } from "react";
import { changeRange } from "#shared";
import classNames from "classnames";

const TextStyles = {
    BOLD: "b",
    ITALIC: "i",
    UNDERLINE: "u",
    CODE: "span"
}
type TextStyles = string;

interface TextEditBlockButtonProps {
    active: boolean;
    icon: string;
    onClick?: (ev: MouseEvent) => void;
}

function TextEditBlockButton({ active, icon, onClick }: TextEditBlockButtonProps) {
    return <div className={classNames(styles.action)}>
        <div className={classNames(styles.actionSelect, active && styles.actionSelectActive)} />
        <img
            src={icon}
            onClick={onClick}
        />
    </div>
}

interface TextEditBlockProps {
    textRef: RefObject<HTMLDivElement | null>;
}

export function TextEditBlock(_: TextEditBlockProps) {
    const [isBold, setBold] = useState(false);
    const [isItalic, setItalic] = useState(false);
    const [isUnderline, setUnderline] = useState(false);
    const [isCode, setCode] = useState(false);

    useEffect(() => {
        document.addEventListener("selectionchange", onSelectionChange);
        return () => document.removeEventListener("selectionchange", onSelectionChange);
    }, []);

    function onSelectionChange() {
        const selection = window.getSelection();

        if (!selection || !selection.focusNode) {
            return;
        }

        // setBold(searchForParentTag(selection.focusNode, TextStyles.BOLD, true));
        // setItalic(searchForParentTag(selection.focusNode, TextStyles.ITALIC, true));
        // setUnderline(searchForParentTag(selection.focusNode, TextStyles.UNDERLINE, true));
        // setCode(searchForParentTag(selection.focusNode, TextStyles.CODE, true));
    }

    function applyStyles(ev: MouseEvent, style: TextStyles) {
        const selection = window.getSelection();

        if (!selection || !selection.focusNode) {
            return;
        }

        changeRange(style);
    }

    return <div className={styles.actions}>
        <TextEditBlockButton
            active={isBold}
            icon={BoldIcon}
            onClick={(ev) => applyStyles(ev, TextStyles.BOLD)}
        />
        <TextEditBlockButton
            active={isItalic}
            icon={ItalicIcon}
            onClick={(ev) => applyStyles(ev, TextStyles.ITALIC)}
        />
        <TextEditBlockButton
            active={isUnderline}
            icon={UnderlineIcon}
            onClick={(ev) => applyStyles(ev, TextStyles.UNDERLINE)}
        />
        <TextEditBlockButton
            active={isCode}
            icon={CodeIcon}
            onClick={(ev) => applyStyles(ev, TextStyles.CODE)}
        />
    </div>
}