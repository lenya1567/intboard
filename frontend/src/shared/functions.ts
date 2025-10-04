export const ValidationType = {
    NotEmpty: "NotEmpty",
    NewPassword: "NewPassword",
    Password: "Password",
    NoValidation: "NoValidation",
} as const;

export type ValidationType = keyof typeof ValidationType;

export function validateValue(validation: ValidationType, value: string) {
    switch (validation) {
        case ValidationType.NotEmpty:
            return !!value;
        case ValidationType.NewPassword:
            return value && value.length >= 8;
        case ValidationType.Password:
            return !!value;
        case ValidationType.NoValidation:
            return true;
    }
}

export function typeByValidation(validation?: ValidationType) {
    switch (validation) {
        case ValidationType.NotEmpty:
            return "text";
        case ValidationType.NewPassword:
        case ValidationType.Password:
            return "password";
        case ValidationType.NoValidation:
            return "text";
    }
    return "text";
}