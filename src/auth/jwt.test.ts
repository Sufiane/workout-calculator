import { describe, it, expect } from 'vitest';
import { signJwt, verifyJwt } from './jwt';

const SECRET = 'test-secret';

describe('jwt', () => {
    it('round-trips a valid token', async () => {
        const token = await signJwt({ sub: 'u1', email: 'a@b.co', type: 'access' }, SECRET, 300);
        const payload = await verifyJwt(token, SECRET, 'access');

        expect(payload).not.toBeNull();
        expect(payload?.sub).toBe('u1');
        expect(payload?.email).toBe('a@b.co');
    });

    it('rejects a wrong secret', async () => {
        const token = await signJwt({ sub: 'u1', email: 'a@b.co', type: 'access' }, SECRET, 300);

        expect(await verifyJwt(token, 'other-secret', 'access')).toBeNull();
    });

    it('rejects a token of the wrong type', async () => {
        const token = await signJwt({ sub: 'u1', email: 'a@b.co', type: 'refresh' }, SECRET, 300);

        expect(await verifyJwt(token, SECRET, 'access')).toBeNull();
    });

    it('rejects an expired token', async () => {
        const token = await signJwt({ sub: 'u1', email: 'a@b.co', type: 'access' }, SECRET, -10);

        expect(await verifyJwt(token, SECRET, 'access')).toBeNull();
    });

    it('rejects a tampered token', async () => {
        const token = await signJwt({ sub: 'u1', email: 'a@b.co', type: 'access' }, SECRET, 300);
        const tampered = token.slice(0, -2) + (token.endsWith('a') ? 'b' : 'a');

        expect(await verifyJwt(tampered, SECRET, 'access')).toBeNull();
    });
});
