export const Colors = {
    Background: 'background',
    Primary: 'primary',
} as const;

type ColorsKeys = keyof typeof Colors;
export type Colors = typeof Colors[ColorsKeys];