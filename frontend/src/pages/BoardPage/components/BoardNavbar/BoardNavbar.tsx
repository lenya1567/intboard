import { NavBarBreak, NavbarContainer, NavbarItem, NavbarLogo } from "#widgets/Navbar";

import ExportIcon from "#assets/icons/export.svg";
import PeopleIcon from "#assets/icons/people.svg";

export default function BoardNavbar() {
    return <NavbarContainer withHidden>
        <NavbarLogo />
        <NavbarItem title="Приколист" caption="Доска:" />
        <NavBarBreak />
        <NavbarItem title="Экспортировать" img={ExportIcon} />
        <NavbarItem title="Настройки доступа" img={PeopleIcon} />
    </NavbarContainer>
}