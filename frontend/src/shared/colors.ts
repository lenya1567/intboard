import convert from "color-convert";

export const Colors = {
    Background: 'background',
    Primary: 'primary',
} as const;

type ColorsKeys = keyof typeof Colors;
export type Colors = typeof Colors[ColorsKeys];

export function getColorByIndex(index: number) {
    const colorCode = [
        (index * 50 + 20) % 360,
        100,
        75
    ];
    return convert.hsv.rgb(colorCode[0], colorCode[1], colorCode[2])
}