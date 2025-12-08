import { useCallback, useEffect, useMemo, useState, type MouseEvent, type PropsWithChildren } from "react";
import { FormContext } from "../../context/context";
import { validateValue, type ClassNameProps, type ValidationType } from "#shared";

type FormProps = PropsWithChildren & ClassNameProps & {
    defaultValue?: Record<string, string>;
    onSubmit: (form: Record<string, string>) => Promise<Record<string, boolean | string | undefined> | void>;
}

export function Form(props: FormProps) {
    const [form, setForm] = useState<Record<string, string>>({});
    const [formUpdated, setFormUpdated] = useState(false);
    const [validations, setValidations] = useState<Record<string, ValidationType>>({});
    const [errors, setErrors] = useState<Record<string, string | boolean | undefined>>({});

    useEffect(() => {
        if (props.defaultValue) {
            setForm(props.defaultValue);
        }
    }, [props.defaultValue]);

    const handleUpdate = useCallback((field: string, value: string) => {
        if (form[field] !== value) {
            setFormUpdated(true);
        }
        setForm(prev => ({
            ...prev,
            [field]: value
        }));
    }, [form, setForm]);

    const handleSetValidation = useCallback((field: string, validation: ValidationType) => {
        setValidations(prev => ({
            ...prev,
            [field]: validation
        }));
    }, [setValidations])

    const handleSubmit = useCallback(async () => {
        const newErrors: Record<string, string | boolean | undefined> = errors;
        for (const key in validations) {
            if (!validateValue(validations[key], form[key])) {
                newErrors[key] = true;
            } else {
                if (typeof newErrors[key] === 'boolean') {
                    delete newErrors[key];
                }
            }
            if (form[key] === undefined) form[key] = "";
        }

        setErrors({ ...newErrors });

        if (!Object.values(newErrors).filter((E) => typeof E === 'boolean').length) {
            const extraErrors = await props.onSubmit(form);
            setErrors(extraErrors ?? {});
        }
    }, [form, errors, validations, setForm, setErrors]);

    const preventDefault = useCallback((ev: MouseEvent<HTMLFormElement>) => ev.preventDefault(), [])

    const value = useMemo(() => ({
        formUpdated,
        errors,
        form,
        setForm: handleUpdate,
        setFieldValidation: handleSetValidation,
        onSubmit: handleSubmit
    }), [formUpdated, errors, form, handleUpdate, handleSetValidation, handleSubmit]);

    return <FormContext.Provider value={value}>
        <form className={props.className} onSubmit={preventDefault}>
            {props.children}
        </form>
    </FormContext.Provider>
}