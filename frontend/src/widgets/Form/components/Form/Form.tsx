import { useCallback, useMemo, useState, type MouseEvent, type PropsWithChildren } from "react";
import { FormContext } from "../../context/context";
import { validateValue, type ClassNameProps, type ValidationType } from "#shared";

type FormProps = PropsWithChildren & ClassNameProps & {
    onSubmit: (form: Record<string, string>) => Promise<Record<string, boolean | string | undefined> | void>;
}

export function Form(props: FormProps) {
    const [form, setForm] = useState<Record<string, string>>({});
    const [validations, setValidations] = useState<Record<string, ValidationType>>({});
    const [errors, setErrors] = useState<Record<string, string | boolean | undefined>>({});

    const handleUpdate = useCallback((field: string, value: string) => {
        setForm(prev => ({
            ...prev,
            [field]: value
        }));
    }, [setForm]);

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
        errors,
        form,
        setForm: handleUpdate,
        setFieldValidation: handleSetValidation,
        onSubmit: handleSubmit
    }), [errors, form, handleUpdate, handleSetValidation, handleSubmit]);

    return <FormContext.Provider value={value}>
        <form className={props.className} onSubmit={preventDefault}>
            {props.children}
        </form>
    </FormContext.Provider>
}