import type { ValidationType } from "#shared";
import { createContext } from "react";

type FormContextType = {
    formUpdated: boolean,
    form: Record<string, string>,
    errors: Record<string, string | boolean | undefined>,
    setForm: (field: string, value: string) => void;
    setFieldValidation: (field: string, validation: ValidationType) => void,
    onSubmit: () => void;
}

export const FormContext = createContext<FormContextType>({
    formUpdated: false,
    form: {},
    errors: {},
    setForm: () => { },
    setFieldValidation: (_1: string, _2: ValidationType) => { },
    onSubmit: () => { },
});