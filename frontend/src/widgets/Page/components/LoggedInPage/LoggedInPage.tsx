import { useContext, useEffect, type PropsWithChildren } from "react";
import styles from "./LoggedInPage.module.css";
import { needAuth, type ColorProps } from "#shared";
import classNames from "classnames";
import { LoggedNavbar } from "#widgets/Navbar";
import { UserContext } from "#app/router/lib/context";
import { Spinner } from "#widgets/Spinner";
import { useSearchParams } from "react-router-dom";
import { LoginModal } from "#widgets/Navbar/components/LoginModal/LoginModal";
import { SignUpModal } from "#widgets/Navbar/components/SignUpModal/SignUpModal";

type PageProps = PropsWithChildren & ColorProps & {
    centered?: boolean;
    noNav?: boolean;
}

export function LoggedInPage({ color, children, centered, noNav }: PageProps) {
    const user = useContext(UserContext);
    const [query, setQuery] = useSearchParams();

    useEffect(() => {
        if (!needAuth()) return;

        if (user.isLoaded && !user.loggedIn) {
            setQuery({ login: "true" });
        }
        if (user.isLoaded && user.loggedIn && query.has("login")) {
            query.delete("login", "true");
            setQuery(query);
        }
    }, [user, setQuery, query]);

    return <div className={
        classNames(
            styles.page,
            color && styles[`color-${color}`],
            centered && styles['align-center']
        )
    }>
        {!user.isLoaded
            ? <div className={styles.loading}>
                <Spinner />
            </div>
            : (
                user.loggedIn
                    ? <div className={styles.content}>
                        {!noNav && <LoggedNavbar />}
                        {children}
                    </div>
                    : <>
                        <LoginModal important />
                        <SignUpModal important />
                    </>
            )
        }
    </div>
}