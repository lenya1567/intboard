import { NavBarBreak, NavbarContainer, NavbarItem, NavbarLogo } from "#widgets/Navbar";

import ExportIcon from "#assets/icons/export.svg";
import PeopleIcon from "#assets/icons/people.svg";
import { useCallback, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BoardContext } from "#entities/board/model/context";
import { ChangeNameModal } from "../ChangeNameModal/ChangeNameModal";
import { UploadImageModal } from "../UploadImageModal/UploadImageModal";
import { InviteMembersModal } from "../InviteMembersModal/InviteMembersModal";

export default function BoardNavbar() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const board = useContext(BoardContext);

    const onChangeName = useCallback(() => {
        searchParams.set("change-name", "true");
        setSearchParams(searchParams);
    }, [searchParams, setSearchParams]);

    const onExport = useCallback(() => {
        window.open(`/export/${board?.board?.id}?type=pdf`);
    }, [navigate, board]);

    const onInviteMembers = useCallback(() => {
        searchParams.set("new-members", "true");
        setSearchParams(searchParams);
    }, [searchParams, setSearchParams]);

    return <NavbarContainer withHidden>
        {board && <ChangeNameModal board={board?.board} />}
        <UploadImageModal />
        <InviteMembersModal />

        <NavbarLogo />
        <NavbarItem title={board?.board?.description?.name ?? ""} caption="Доска:" onClick={onChangeName} />
        <NavBarBreak />
        <NavbarItem title="Экспортировать" img={ExportIcon} onClick={onExport} />
        <NavbarItem title="Настройки доступа" img={PeopleIcon} onClick={onInviteMembers} />
    </NavbarContainer>
}