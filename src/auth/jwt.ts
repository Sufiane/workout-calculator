const encoder = new TextEncoder();
const decoder = new TextDecoder();

export type TokenType = 'access' | 'refresh';

export interface JwtPayload {
    sub: string;
    email: string;
    type: TokenType;
    iat: number;
    exp: number;
}

function toBase64Url(input: ArrayBuffer | Uint8Array | string): string {
    let bytes: Uint8Array;

    if (typeof input === 'string') {
        bytes = encoder.encode(input);
    } else if (input instanceof Uint8Array) {
        bytes = input;
    } else {
        bytes = new Uint8Array(input);
    }

    let binary = '';

    for (let index = 0; index < bytes.length; index++) {
        binary += String.fromCharCode(bytes[index]);
    }

    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(value: string): Uint8Array {
    const padded = value.replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);

    for (let index = 0; index < binary.length; index++) {
        bytes[index] = binary.charCodeAt(index);
    }

    return bytes;
}

function importKey(secret: string): Promise<CryptoKey> {
    return crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

export async function signJwt(claims: { sub: string; email: string; type: TokenType }, secret: string, ttlSeconds: number): Promise<string> {
    const issuedAt = Math.floor(Date.now() / 1000);
    const payload: JwtPayload = {
        sub: claims.sub,
        email: claims.email,
        type: claims.type,
        iat: issuedAt,
        exp: issuedAt + ttlSeconds,
    };
    const encodedHeader = toBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const encodedPayload = toBase64Url(JSON.stringify(payload));
    const data = encodedHeader + '.' + encodedPayload;
    const key = await importKey(secret);
    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));

    return data + '.' + toBase64Url(signature);
}

export async function verifyJwt(token: string, secret: string, expectedType: TokenType): Promise<JwtPayload | null> {
    const parts = token.split('.');

    if (parts.length !== 3) {
        return null;
    }

    const data = parts[0] + '.' + parts[1];
    const key = await importKey(secret);
    const valid = await crypto.subtle.verify('HMAC', key, fromBase64Url(parts[2]), encoder.encode(data));

    if (!valid) {
        return null;
    }

    let payload: JwtPayload;

    try {
        payload = JSON.parse(decoder.decode(fromBase64Url(parts[1]))) as JwtPayload;
    } catch {
        return null;
    }

    const now = Math.floor(Date.now() / 1000);

    if (payload.type !== expectedType || payload.exp < now) {
        return null;
    }

    return payload;
}
