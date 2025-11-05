import type { Board } from "#entities/board";
import { createContext } from "react";

export const BoardContext = createContext<Board | null>(null);