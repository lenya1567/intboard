import type { ChangeEvent, MouseEvent } from "react";
import type { Colors } from "./colors";

export interface ClassNameProps {
    className?: string;
}

export interface ButtonActionsProps {
    onClick?: (ev: MouseEvent) => void;
}

export interface TextFieldActionsProps {
    onChange?: (ev: ChangeEvent) => void;
}

export interface ColorProps {
    color?: Colors;
}