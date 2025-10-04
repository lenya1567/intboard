import { getUser, type User } from "#entities";
import { Errors } from "#shared";
import { createContext, useCallback, useEffect, useMemo, useState, type PropsWithChildren } from "react";

interface UserContextProps {
    loggedIn: boolean;
    user: User | null;
    getUser: () => void;
    resetUser: () => void;
    logoutUser: () => void;
}

export const UserContext = createContext<UserContextProps>({
    loggedIn: false,
    user: null,
    getUser: () => { },
    resetUser: () => { },
    logoutUser: () => { },
});

export default function UserContextProvider(props: PropsWithChildren) {
    const [user, setUser] = useState<User | null>(null);

    const handleFetchUser = useCallback(async () => {
        const { error, data } = await getUser();

        if (error === Errors.NoError) {
            setUser(data!);
        }
    }, []);

    useEffect(() => {
        handleFetchUser();
    }, []);

    const value = useMemo(() => ({
        user,
        loggedIn: user !== undefined,
        getUser: () => handleFetchUser(),
        resetUser: () => handleFetchUser(),
        logoutUser: () => setUser(null)
    }), [user, setUser, handleFetchUser]);

    return (
        <UserContext value={value}>
            {props.children}
        </UserContext>
    )
}