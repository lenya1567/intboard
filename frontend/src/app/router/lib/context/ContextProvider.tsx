import type { PropsWithChildren } from "react";
import DragContextProvider from "./DragContext";
import UserContextProvider from "./UserContext";

export function ContextProvider(props: PropsWithChildren) {
    return <UserContextProvider>
        <DragContextProvider>
            {props.children}
        </DragContextProvider>
    </UserContextProvider>
}