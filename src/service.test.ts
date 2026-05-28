import { describe, it, expect } from 'vitest';
import { generateBenchProgram, calculateFromMaxRm } from './service';

describe('calculateFromMaxRm', () => {
    it('derives the full program from a 1RM', () => {
        expect(calculateFromMaxRm(100)).toEqual({
            maxRm: 100,
            max90: 90,
            rep85: 77.5,
            rep90: 80,
            rep95: 85,
            nextMax90: 92.5,
        });
    });
});

describe('generateBenchProgram', () => {
    it('dispatches on the provided input', () => {
        expect(generateBenchProgram({ maxRm: 100 }).max90).toBe(90);
    });

    it('keeps the supplied value when computing from a rep load', () => {
        const program = generateBenchProgram({ rep85: 80 });
        expect(program.rep85).toBe(80);
    });

    it('throws when no input is given', () => {
        expect(() => generateBenchProgram({})).toThrow('min_one_ref_value_needed');
    });
});
