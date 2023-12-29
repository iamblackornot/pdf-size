export function isNumber(num) {
    return !isNaN(+ num)
}

export function round(num, decimals) {
    return +(Math.round(num + `e+${decimals}`) + `e-${decimals}`);
}

export const INCH_IN_MM = 25.4;

export function inchToMM(inchValue) {
    return round(inchValue * INCH_IN_MM, 2);
}

export function mmToInch(mmValue) {
    return round(mmValue / INCH_IN_MM, 2);
}