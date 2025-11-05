import { getColorByIndex } from '#shared';
import { useMemo } from 'react';
import styles from './Avatar.module.css';

type AvatarProps = {
    displayName: string;
    colorIndex: number;
}

export function Avatar(props: AvatarProps) {
    const color = useMemo(() => {
        const colorCode = getColorByIndex(props.colorIndex ?? 0);
        return `rgb(${colorCode[0]}, ${colorCode[1]}, ${colorCode[2]})`;
    }, [props.colorIndex]);

    console.log(color);

    return <div className={styles.avatar} style={{ backgroundColor: color }}>
        {props.displayName.split(" ").map((E) => E[0].toUpperCase()).join("")}
    </div>
}