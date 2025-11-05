import type { ClassNameProps } from "#shared";
import { useCallback, useState, type PropsWithChildren } from "react";
import styles from "./NavbarContainer.module.css";
import classNames from "classnames";
import SidebarImage from "#assets/icons/sidebar.svg";

type NavbarContainerProps = {
    withHidden?: boolean
} & PropsWithChildren<ClassNameProps>;

export function NavbarContainer(props: NavbarContainerProps) {
    const [isNavBarOpened, openNavBar] = useState(!props.withHidden);

    const handleToggle = useCallback(() => {
        openNavBar(prev => !prev);
    }, []);

    return <div className={classNames(styles.nav, props.className)}>
        {props.withHidden && <div className={classNames(styles.navIcon, isNavBarOpened ? styles.iconOpened : styles.iconClosed)} onClick={handleToggle}>
            <img src={SidebarImage} />
        </div>}
        <div className={classNames(styles.elements, isNavBarOpened ? styles.opened : styles.closed)}>
            <div className={styles.elementsChildren}>
                {props.children}
            </div>
        </div>
    </div>
}