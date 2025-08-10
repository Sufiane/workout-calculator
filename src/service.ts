import { rounding } from './utils/round.utils';
import { Program } from './types/program.type';


export function calculateFromMaxRm(maxRm: number): Program {
    const max90 = rounding(maxRm * 0.9);

    return {
        maxRm,
        max90,
        rep85: rounding(max90 * 0.85),
        rep90: rounding(max90 * 0.90),
        rep95: rounding(max90 * 0.95),
        nextMax90: rounding(max90 + 2.5),
    };
}

export function calculateFromMax90(max90: number): Program {
    return {
        maxRm: rounding(max90 * 100 / 90),
        max90,
        rep85: rounding(max90 * 0.85),
        rep90: rounding(max90 * 0.90),
        rep95: rounding(max90 * 0.95),
        nextMax90: rounding(max90 + 2.5),
    };
}

export function calculateFromRep95(rep95: number): Program {
    const max90 = rounding(rep95 * 100 / 95);

    return {
        maxRm: rounding(max90 * 100 / 90),
        max90,
        rep85: rounding(max90 * 0.85),
        rep90: rounding(max90 * 0.90),
        rep95: rep95,
        nextMax90: rounding(max90 + 2.5),
    };
}

export function calculateFromRep90(rep90: number): Program {
    const max90 = rounding(rep90 * 100 / 90);

    return {
        maxRm: rounding(max90 * 100 / 90),
        max90,
        rep85: rounding(max90 * 0.85),
        rep90: rep90,
        rep95: rounding(max90 * 0.95),
        nextMax90: rounding(max90 + 2.5),
    };
}

export function calculateFromRep85(rep85: number): Program {
    const max90 = rounding(rep85 * 100 / 85);

    return {
        maxRm: rounding(max90 * 100 / 90),
        max90,
        rep85: rep85,
        rep90: rounding(max90 * 0.90),
        rep95: rounding(max90 * 0.95),
        nextMax90: rounding(max90 + 2.5),
    };
}

export const generateBenchProgram = ({
    maxRm,
    max90,
    rep85,
    rep90,
    rep95,
}: {
    maxRm?: number;
    max90?: number;
    rep85?: number;
    rep90?: number;
    rep95?: number;
}): Program => {
    if (!maxRm && !max90 && !rep85 && !rep90 && !rep95) {
        throw new Error('min_one_ref_value_needed');
    }

    switch (true) {
        case maxRm !== undefined:
            return calculateFromMaxRm(maxRm);
        case max90 !== undefined:
            return calculateFromMax90(max90);
        case rep95 !== undefined:
            return calculateFromRep95(rep95);
        case rep90 !== undefined:
            return calculateFromRep90(rep90);
        case rep85 !== undefined:
            return calculateFromRep85(rep85);
        default:{
            throw new Error('missing_params')
        }
    }
};
