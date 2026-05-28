import { createUser, findUserByEmail } from './auth.db';
import { getRate, setRate } from './rate.db';
import { signJwt, verifyJwt } from './jwt';

const PBKDF2_ITERATIONS = 100000;
const KEY_LENGTH_BITS = 256;

export const ACCESS_TTL_SECONDS = 300;
export const REFRESH_TTL_SECONDS = 604800;

const RATE_WINDOW_MS = 60000;
const RATE_MAX_ATTEMPTS = 10;

const encoder = new TextEncoder();

export class AuthError extends Error {
    public status: number;

    constructor(message: string, status: number) {
        super(message);
        this.status = status;
    }
}

export interface AuthResult {
    user: { id: string; email: string };
    accessToken: string;
    refreshToken: string;
}

export async function enforceRateLimit(env: Env, ip: string, action: string): Promise<void> {
    const key = action + ':' + ip;
    const now = Date.now();
    const row = await getRate(env, key);

    if (!row || now > row.reset_at) {
        await setRate(env, key, 1, now + RATE_WINDOW_MS);
        return;
    }

    if (row.count >= RATE_MAX_ATTEMPTS) {
        throw new AuthError('rate_limited', 429);
    }

    await setRate(env, key, row.count + 1, row.reset_at);
}

function toBase64(bytes: Uint8Array): string {
    let binary = '';

    for (let index = 0; index < bytes.length; index++) {
        binary += String.fromCharCode(bytes[index]);
    }

    return btoa(binary);
}

function fromBase64(value: string): Uint8Array {
    const binary = atob(value);
    const bytes = new Uint8Array(binary.length);

    for (let index = 0; index < binary.length; index++) {
        bytes[index] = binary.charCodeAt(index);
    }

    return bytes;
}

async function derive(password: string, salt: Uint8Array): Promise<ArrayBuffer> {
    const keyMaterial = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);

    return crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' }, keyMaterial, KEY_LENGTH_BITS);
}

export async function hashPassword(password: string): Promise<{ hash: string; salt: string }> {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const derived = await derive(password, salt);

    return { hash: toBase64(new Uint8Array(derived)), salt: toBase64(salt) };
}

function constantTimeEqual(left: Uint8Array, right: Uint8Array): boolean {
    if (left.length !== right.length) {
        return false;
    }

    let mismatch = 0;

    for (let index = 0; index < left.length; index++) {
        mismatch |= left[index] ^ right[index];
    }

    return mismatch === 0;
}

async function verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
    const derived = await derive(password, fromBase64(salt));

    return constantTimeEqual(new Uint8Array(derived), fromBase64(hash));
}

function validateCredentials(email: string, password: string): void {
    const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

    if (!emailPattern.test(email)) {
        throw new AuthError('invalid_email', 400);
    }

    if (password.length < 8) {
        throw new AuthError('weak_password', 400);
    }
}

async function issueTokens(env: Env, userId: string, email: string): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = await signJwt({ sub: userId, email, type: 'access' }, env.AUTH_SECRET, ACCESS_TTL_SECONDS);
    const refreshToken = await signJwt({ sub: userId, email, type: 'refresh' }, env.AUTH_SECRET, REFRESH_TTL_SECONDS);

    return { accessToken, refreshToken };
}

export async function signup(env: Env, email: string, password: string): Promise<AuthResult> {
    validateCredentials(email, password);

    const normalizedEmail = email.toLowerCase();
    const existing = await findUserByEmail(env, normalizedEmail);

    if (existing) {
        throw new AuthError('email_taken', 409);
    }

    const { hash, salt } = await hashPassword(password);
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    await createUser(env, { id, email: normalizedEmail, passwordHash: hash, passwordSalt: salt, createdAt });

    const tokens = await issueTokens(env, id, normalizedEmail);

    return { user: { id, email: normalizedEmail }, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
}

export async function login(env: Env, email: string, password: string): Promise<AuthResult> {
    const normalizedEmail = email.toLowerCase();
    const user = await findUserByEmail(env, normalizedEmail);

    if (!user) {
        throw new AuthError('invalid_credentials', 401);
    }

    const matches = await verifyPassword(password, user.password_hash, user.password_salt);

    if (!matches) {
        throw new AuthError('invalid_credentials', 401);
    }

    const tokens = await issueTokens(env, user.id, user.email);

    return { user: { id: user.id, email: user.email }, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
}

export async function refresh(env: Env, refreshToken: string): Promise<AuthResult> {
    const payload = await verifyJwt(refreshToken, env.AUTH_SECRET, 'refresh');

    if (!payload) {
        throw new AuthError('invalid_token', 401);
    }

    const tokens = await issueTokens(env, payload.sub, payload.email);

    return { user: { id: payload.sub, email: payload.email }, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
}
