import { getUser, type User } from "#entities/user";
import { Errors } from "#shared";
import { createContext, useCallback, useEffect, useMemo, useState, type PropsWithChildren } from "react";

interface UserContextProps {
    loggedIn: boolean;
    isLoaded: boolean;
    user: User | null | undefined;
    getUser: () => void;
    resetUser: () => void;
    logoutUser: () => void;
}

export const UserContext = createContext<UserContextProps>({
    loggedIn: false,
    isLoaded: false,
    user: null,
    getUser: () => { },
    resetUser: () => { },
    logoutUser: () => { },
});

export default function UserContextProvider(props: PropsWithChildren) {
    const [user, setUser] = useState<User | null | undefined>(undefined);

    const handleFetchUser = useCallback(async () => {
        const { error, data } = await getUser();

        if (error === Errors.NoError) {
            setUser(data!);
        } else {
            setUser(null);
        }
    }, []);

    useEffect(() => {
        handleFetchUser();
    }, []);

    const value = useMemo(() => ({
        user,
        loggedIn: !!user,
        isLoaded: user !== undefined,
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