import { createContext, useMemo, useRef, useState, type MouseEvent, type PropsWithChildren, type RefObject } from "react";

export interface DragContextProps {
    boardRef?: RefObject<HTMLDivElement | null>;
    events?: { onMouseMove: (event: MouseEvent<HTMLElement>) => void, onMouseUp: (event: MouseEvent<HTMLElement>) => void };
    actions?: {
        move: (ctx: PositionProps, event: MouseEvent<HTMLElement>) => void,
        end: (ctx: PositionProps, event: MouseEvent<HTMLElement>) => void
    };
    onStart?: (
        event: MouseEvent<HTMLElement>,
        move: (ctx: PositionProps, event: MouseEvent<HTMLElement>) => void,
        end: (ctx: PositionProps, event: MouseEvent<HTMLElement>) => void
    ) => void;
}

export interface PositionProps {
    x: number;
    y: number;
}

export interface DragEvents {
    move: (ctx: PositionProps, event: MouseEvent<HTMLElement>) => void;
    end: (ctx: PositionProps, event: MouseEvent<HTMLElement>) => void;
}

export const DragContext = createContext<DragContextProps>({});

export default function DragContextProvider(props: PropsWithChildren) {
    const [dragValue, setDragValue] = useState<DragContextProps>({});

    const boardRef = useRef<HTMLDivElement>(null);
    const position = useRef<PositionProps>(null);
    const events = useRef<DragEvents>(null);

    function onMouseMove(event: MouseEvent<HTMLElement>) {
        events.current!.move(position.current!, event);
    }

    function onMouseUp(event: MouseEvent<HTMLElement>) {
        events.current!.end(position.current!, event);
        setDragValue(prev => ({
            ...prev,
            events: undefined,
        }))
    }

    function onStart(
        event: MouseEvent<HTMLElement>,
        move: (ctx: PositionProps, event: MouseEvent<HTMLElement>) => void,
        end: (ctx: PositionProps, event: MouseEvent<HTMLElement>) => void
    ) {
        position.current = {
            x: event.clientX,
            y: event.clientY
        }

        events.current = {
            move, end
        }

        setDragValue(prev => ({
            ...prev,
            actions: { move, end },
            events: {
                onMouseMove,
                onMouseUp
            }
        }))
    }

    const value = useMemo(() => ({
        ...dragValue,
        boardRef,
        onStart
    }), [dragValue, onStart]);

    return (
        <DragContext value={value}>
            {props.children}
        </DragContext >
    )
}