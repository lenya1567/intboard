import type { ValidationType } from "#shared";
import { createContext } from "react";

type FormContextType = {
    form: Record<string, string>,
    errors: Record<string, string | boolean | undefined>,
    setForm: (field: string, value: string) => void;
    setFieldValidation: (field: string, validation: ValidationType) => void,
    onSubmit: () => void;
}

export const FormContext = createContext<FormContextType>({
    form: {},
    errors: {},
    setForm: () => { },
    setFieldValidation: (_1: string, _2: ValidationType) => { },
    onSubmit: () => { },
});