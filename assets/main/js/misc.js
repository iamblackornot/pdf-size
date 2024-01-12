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

export function lowerBoundDouble(value, sortedArr) {
    const res = sortedArr.findIndex((el) => equalDouble(el, value) || greaterDouble(el, value));
    return res > 0 ? res : sortedArr.length;
}

export function upperBoundDouble(value, sortedArr) {
    const res = sortedArr.findIndex((el) => greaterDouble(el, value));
    return res > 0 ? res : sortedArr.length;
}

const EPSILON = 0.01;

export function equalDouble(lhs, rhs) {
    return Math.abs(lhs - rhs) < EPSILON;
}
export function lessDouble(lhs, rhs) {
    return lhs <= rhs - EPSILON;
}
export function greaterDouble(lhs, rhs) {
    return lhs >= rhs + EPSILON;
}

export function readFileAsText(filePath) {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.onerror = () => reject('error reading file')
      reader.readAsText(filePath)
    })
}

export async function readFileAsString(file) {
    const response = await fetch(file)

    if(response.ok) return response.text();

    return '';
}