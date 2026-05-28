import { describe, it, expect } from 'vitest';
import { rounding } from './round.utils';

describe('rounding', () => {
    it('keeps exact multiples of 2.5', () => {
        expect(rounding(80)).toBe(80);
        expect(rounding(82.5)).toBe(82.5);
    });

    it('rounds to the nearest 2.5', () => {
        expect(rounding(81)).toBe(80);
        expect(rounding(84)).toBe(85);
    });

    it('rounds up on a tie', () => {
        expect(rounding(81.25)).toBe(82.5);
    });
});
