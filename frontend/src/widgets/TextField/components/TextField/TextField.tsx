import { typeByValidation, ValidationType, type ClassNameProps, type TextFieldActionsProps } from "#shared";
import { useCallback, useContext, useEffect, useMemo, type ChangeEvent } from "react";
import styles from "./TextField.module.css";
import { FormContext } from "#widgets/Form";
import classNames from "classnames";

type TextFieldProps = ClassNameProps & TextFieldActionsProps & {
    name?: string;
    title: string;
    textarea?: boolean;
    message?: string;
    validation?: ValidationType;
}

export function TextField(props: TextFieldProps) {
    const formContext = useContext(FormContext);

    useEffect(() => {
        if (formContext && props.name) {
            formContext.setFieldValidation(props.name!, props.validation ?? ValidationType.NoValidation);
        }
    }, []);

    const handleChange = useCallback((ev: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const newValue = ev.target.value;
        if (formContext && props.name) {
            formContext.setForm(props.name!, newValue);
        }
        props.onChange?.(ev);
    }, [formContext, formContext.setForm]);

    const type = useMemo(() => typeByValidation(props.validation), [props.validation]);

    return (
        <div className={styles.textField}>
            <div className={styles.label}>
                {props.title}
            </div>
            {
                !props.textarea
                    ? <input autoComplete={props.name} type={type} className={classNames(styles.input, props.className)} onChange={handleChange} />
                    : <textarea autoComplete={props.name} className={classNames(styles.input, props.className)} onChange={handleChange} />
            }
            {(formContext.errors[props.name ?? ""]) && <div className={styles.error}>
                {typeof formContext.errors[props.name!] === 'boolean'
                    ? props.message
                    : formContext.errors[props.name!]
                }
            </div>}
        </div>
    )
}