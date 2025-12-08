import { useCallback, useState } from "react";
import styles from "./FileUpload.module.css";

type TextFieldProps = {
    onSelected: () => void;
}

export function FileUpload(props: TextFieldProps) {
    const [file, setFile] = useState<File>();

    const onFileUpload = useCallback((ev: any) => {
        setFile(ev.target.files[0]);
        props.onSelected();
        console.log("YES")
    }, [props.onSelected, setFile]);

    return (
        <div className={styles.upload}>
            <label htmlFor="test" className={styles.uploader}>{file ? file.name : "Выберите файл"}</label>
            <input name="image" id="test" type="file" className={styles.file} onChange={onFileUpload} />
        </div>
    )
}