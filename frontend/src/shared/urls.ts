const NOT_AUTH_PATHS = [
    "/",
];

export function needAuth() {
    return !NOT_AUTH_PATHS.includes(location.pathname);
}