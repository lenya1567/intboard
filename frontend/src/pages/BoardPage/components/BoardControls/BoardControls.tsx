import styles from "./BoardControls.module.css";
import AddIcon from "#assets/icons/add.svg";
import PictureIcon from "#assets/icons/picture.svg";
import type { ButtonActionsProps } from "#shared";
import { useCallback, useContext, useRef, type MouseEvent } from "react";
import { ControlContext } from "../../model/ControlContext";
import classNames from "classnames";

type BoardControlsButtonProps = {
    name: string,
    nowName: string | null,
    imgSrc: string
} & ButtonActionsProps

function BoardControlsButton({ name, nowName, imgSrc, onClick }: BoardControlsButtonProps) {
    return <div data-name={name} className={classNames(styles.button, (name === nowName) && styles.active)} onClick={onClick}>
        <img src={imgSrc} />
    </div>
}

export function BoardControls() {
    const controlContext = useContext(ControlContext);
    const evListener = useRef(undefined);

    const keyboardDown = useCallback((ev: any) => {
        if (ev.key === "Escape") {
            controlContext.actions.setControls(null);
            window.removeEventListener('keyup', keyboardDown);
        }
    }, []);

    const handleControlClick = useCallback((ev: MouseEvent<HTMLDivElement>) => {
        controlContext.actions.setControls(ev.currentTarget.dataset.name!);
        window.addEventListener('keyup', keyboardDown);
    }, [controlContext, keyboardDown, evListener]);

    return <div className={styles.controls}>
        <BoardControlsButton
            name="addBlock"
            nowName={controlContext.controls.nowAction}
            imgSrc={AddIcon}
            onClick={handleControlClick}
        />
        <BoardControlsButton
            name="addImage"
            nowName={controlContext.controls.nowAction}
            imgSrc={PictureIcon}
            onClick={handleControlClick}
        />
    </div>
}