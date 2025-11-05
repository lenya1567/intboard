export const Errors = {
    NoError: "NoError",

    NoUser: "NoUser",
    LoginBusy: "LoginBusy",
    NotAuthorized: "NotAuthorized",

    FormError: "FormError",
    ServerError: "ServerError",
} as const;
export type Errors = keyof typeof Errors;