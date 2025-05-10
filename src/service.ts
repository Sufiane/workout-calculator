import { roundUp } from './utils/round-up.utils';


export function calculateFromMaxRm(maxRm: number) {
    const max90 = roundUp(maxRm * 0.9);

    return {
        maxRm,
        max90,
        rep85: roundUp(max90 * 0.85),
        rep90: roundUp(max90 * 0.90),
        rep95: roundUp(max90 * 0.95),
    };
}

export function calculateFromMax90(max90: number) {
    return {
        maxRm: roundUp(max90 * 100 / 90),
        max90,
        rep85: roundUp(max90 * 0.85),
        rep90: roundUp(max90 * 0.90),
        rep95: roundUp(max90 * 0.95),
    };
}

export function calculateFromRep95(rep95: number) {
    const max90 = rep95 * 100 / 95;

    return {
        maxRm: roundUp(max90 * 100 / 90),
        max90,
        rep85: roundUp(max90 * 0.85),
        rep90: roundUp(max90 * 0.90),
        rep95: rep95,
    };
}

export function calculateFromRep90(rep90: number) {
    const max90 = rep90 * 100 / 90;

    return {
        maxRm: roundUp(max90 * 100 / 90),
        max90,
        rep85: roundUp(max90 * 0.85),
        rep90: rep90,
        rep95: roundUp(max90 * 0.95),
    };
}

export function calculateFromRep85(rep85: number) {
    const max90 = rep85 * 100 / 85;

    return {
        maxRm: roundUp(max90 * 100 / 90),
        max90,
        rep85: roundUp(rep85),
        rep90: roundUp(max90 * 0.90),
        rep95: roundUp(max90 * 0.95),
    };
}
