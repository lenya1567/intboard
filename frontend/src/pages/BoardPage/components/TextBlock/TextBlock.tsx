import { useRef } from 'react';
import { TextEditBlock } from './components/TextEditBlock';
import styles from './TextBlock.module.css';

export function TextBlock() {
    const textRef = useRef<HTMLDivElement>(null);

    return <div className={styles.text}>
        <TextEditBlock textRef={textRef} />
        <div ref={textRef} className={styles.content} contentEditable>
            Hello
            <span>Hello, World!</span>
            <span>PRIKOL</span>
            NEXT
        </div>
    </div>
}