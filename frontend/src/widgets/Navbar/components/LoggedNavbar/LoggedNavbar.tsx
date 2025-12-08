import BoardsIcon from "#assets/icons/boards.svg";
import LogoutIcon from "#assets/icons/logout.svg";
import { useCallback, useContext, useState } from "react";
import { SignOutModal } from "./components/SignOutModal/SignOutModal";
import { signOutUser } from "#entities/auth";
import { Errors } from "#shared";
import { UserContext } from "#app/router/lib/context";
import { LoginModal } from "../LoginModal/LoginModal";
import { SignUpModal } from "../SignUpModal/SignUpModal";
import { useNavigate } from "react-router-dom";
import { NavbarContainer } from "../NavbarContainer/NavbarContainer";
import { NavbarLogo } from "../NavbarContainer/components/NavbarLogo/NavbarLogo";
import { NavbarItem } from "../NavbarContainer/components/NavbarItem/NavbarItem";
import { NavBarBreak } from "../NavbarContainer/components/NavbarBreak/NavbarBreak";
import styles from "./LoggedNavbar.module.css";

export function LoggedNavbar() {
    const [signOutModal, openSignOutModal] = useState(false);
    const navigate = useNavigate();
    const user = useContext(UserContext);

    const handleOpenSignOutModal = useCallback(() => openSignOutModal(true), [openSignOutModal]);
    const handleCloseSignOutModal = useCallback(() => openSignOutModal(false), [openSignOutModal]);
    const handleSignOut = useCallback(async () => {
        const { error } = await signOutUser();
        if (error === Errors.NoError) {
            navigate("/");
            user.logoutUser();
        }
    }, [user, navigate]);

    return <NavbarContainer>
        <LoginModal important />
        <SignUpModal important />
        <SignOutModal opened={signOutModal} onSuccess={handleSignOut} onClose={handleCloseSignOutModal} />

        <NavbarLogo />

        <NavbarItem title="Мои доски" img={BoardsIcon} to="/boards" />

        <NavBarBreak />

        <NavbarItem className={styles.last} danger title="Выйти из профиля" img={LogoutIcon} onClick={handleOpenSignOutModal} />
    </NavbarContainer>
}