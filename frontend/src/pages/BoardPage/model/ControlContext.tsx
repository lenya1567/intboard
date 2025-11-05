import { createContext, useMemo, useState, type PropsWithChildren } from "react";

interface ControlContextProps {
    controls: {
        nowAction: string | null,
    },
    actions: {
        setControls: (newAction: string | null) => void
    }
}

const controlContextDefaultValue: ControlContextProps = {
    controls: {
        nowAction: null,
    },
    actions: {
        setControls: () => { }
    }
};

export const ControlContext = createContext<ControlContextProps>(controlContextDefaultValue);

export function ControlContextProvider({ children }: PropsWithChildren) {
    const [controls, setControls] = useState(controlContextDefaultValue.controls.nowAction);

    const contextValue = useMemo(() => ({
        controls: {
            nowAction: controls,
        },
        actions: {
            setControls
        }
    }), [controls]);

    return <ControlContext.Provider value={contextValue}>
        {children}
    </ControlContext.Provider>
}