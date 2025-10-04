export const Errors = {
    NoError: "NoError",

    NoUser: "NoUser",
    LoginBusy: "LoginBusy",
    NotAuthorized: "NotAuthorized",

    ServerError: "ServerError",
} as const;
export type Errors = keyof typeof Errors;