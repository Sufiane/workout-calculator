import { generateBenchProgram } from './service';
import { appendHistory, getHistory, importHistory } from './history.db';
import type { HistoryEntry } from './history.db';
import { AuthError, enforceRateLimit, login, refresh, signup } from './auth/auth.service';
import { verifyJwt } from './auth/jwt';
import { pruneExpiredRates } from './auth/rate.db';
import { PAGE_HTML } from './page';
import { ICON_SVG, MANIFEST, SERVICE_WORKER } from './pwa';
import { ACCESS_TTL_SECONDS, REFRESH_TTL_SECONDS } from './auth/auth.service';

interface SessionUser {
    sub: string;
    email: string;
}

const CONTENT_SECURITY_POLICY = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "connect-src 'self'",
    "manifest-src 'self'",
    "base-uri 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
].join('; ');

function applySecurityHeaders(response: Response): Response {
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

    return response;
}

const handlePage = (): Response => {
    return new Response(PAGE_HTML, {
        headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Content-Security-Policy': CONTENT_SECURITY_POLICY,
            'X-Frame-Options': 'DENY',
        },
    });
};

const handleFavicon = (): Response => {
    return new Response(null, { status: 204 });
};

const handleManifest = (): Response => {
    return new Response(MANIFEST, {
        headers: { 'Content-Type': 'application/manifest+json' },
    });
};

const handleServiceWorker = (): Response => {
    return new Response(SERVICE_WORKER, {
        headers: {
            'Content-Type': 'application/javascript',
            'Service-Worker-Allowed': '/',
        },
    });
};

const handleIcon = (): Response => {
    return new Response(ICON_SVG, {
        headers: { 'Content-Type': 'image/svg+xml' },
    });
};

function parseCookies(request: Request): Record<string, string> {
    const header = request.headers.get('Cookie');
    const cookies: Record<string, string> = {};

    if (!header) {
        return cookies;
    }

    header.split(';').forEach((part) => {
        const index = part.indexOf('=');

        if (index > -1) {
            const name = part.slice(0, index).trim();
            cookies[name] = decodeURIComponent(part.slice(index + 1).trim());
        }
    });

    return cookies;
}

function buildAuthCookies(accessToken: string, refreshToken: string): string[] {
    const base = 'HttpOnly; Secure; SameSite=Lax';

    return [
        'access_token=' + accessToken + '; Path=/; Max-Age=' + ACCESS_TTL_SECONDS + '; ' + base,
        'refresh_token=' + refreshToken + '; Path=/api/auth/refresh; Max-Age=' + REFRESH_TTL_SECONDS + '; ' + base,
    ];
}

function clearAuthCookies(): string[] {
    const base = 'HttpOnly; Secure; SameSite=Lax; Max-Age=0';

    return [
        'access_token=; Path=/; ' + base,
        'refresh_token=; Path=/api/auth/refresh; ' + base,
    ];
}

function jsonWithCookies(body: unknown, cookies: string[], status: number = 200): Response {
    const response = Response.json(body, { status });

    cookies.forEach((cookie) => {
        response.headers.append('Set-Cookie', cookie);
    });

    return response;
}

function authErrorResponse(error: unknown): Response {
    if (error instanceof AuthError) {
        return Response.json({ error: error.message }, { status: error.status });
    }

    return Response.json({ error: 'auth_failed' }, { status: 500 });
}

function clientIp(request: Request): string {
    return request.headers.get('CF-Connecting-IP') || 'local';
}

async function readCredentials(request: Request): Promise<{ email: string; password: string }> {
    try {
        const body = await request.json<{ email?: string; password?: string }>();

        return { email: String(body.email ?? ''), password: String(body.password ?? '') };
    } catch {
        return { email: '', password: '' };
    }
}

async function getUserFromRequest(request: Request, env: Env): Promise<SessionUser | null> {
    const cookies = parseCookies(request);
    const token = cookies['access_token'];

    if (!token) {
        return null;
    }

    const payload = await verifyJwt(token, env.AUTH_SECRET, 'access');

    if (!payload) {
        return null;
    }

    return { sub: payload.sub, email: payload.email };
}

async function handleSignup(request: Request, env: Env): Promise<Response> {
    const credentials = await readCredentials(request);

    try {
        await enforceRateLimit(env, clientIp(request), 'signup');

        const result = await signup(env, credentials.email, credentials.password);

        return jsonWithCookies({ email: result.user.email }, buildAuthCookies(result.accessToken, result.refreshToken));
    } catch (error) {
        return authErrorResponse(error);
    }
}

async function handleLogin(request: Request, env: Env): Promise<Response> {
    const credentials = await readCredentials(request);

    try {
        await enforceRateLimit(env, clientIp(request), 'login');

        const result = await login(env, credentials.email, credentials.password);

        return jsonWithCookies({ email: result.user.email }, buildAuthCookies(result.accessToken, result.refreshToken));
    } catch (error) {
        return authErrorResponse(error);
    }
}

async function handleRefresh(request: Request, env: Env): Promise<Response> {
    const cookies = parseCookies(request);
    const token = cookies['refresh_token'];

    if (!token) {
        return Response.json({ error: 'no_refresh' }, { status: 401 });
    }

    try {
        const result = await refresh(env, token);

        return jsonWithCookies({ email: result.user.email }, buildAuthCookies(result.accessToken, result.refreshToken));
    } catch (error) {
        return authErrorResponse(error);
    }
}

function handleLogout(): Response {
    return jsonWithCookies({ ok: true }, clearAuthCookies());
}

function handleMe(user: SessionUser | null): Response {
    return Response.json(user ? { email: user.email } : null);
}

async function handleHistory(env: Env, user: SessionUser | null): Promise<Response> {
    const history = user ? await getHistory(env, user.sub) : [];

    return Response.json(history);
}

async function handleImport(request: Request, env: Env, user: SessionUser | null): Promise<Response> {
    if (!user) {
        return Response.json({ error: 'unauthorized' }, { status: 401 });
    }

    let entries: HistoryEntry[] = [];

    try {
        const body = await request.json<{ entries?: HistoryEntry[] }>();
        const candidates = Array.isArray(body.entries) ? body.entries : [];
        entries = candidates
            .filter((entry) => entry && typeof entry.createdAt === 'string' && entry.program != null)
            .slice(0, 20);
    } catch {
        entries = [];
    }

    await importHistory(env, user.sub, entries);

    const history = await getHistory(env, user.sub);

    return Response.json(history);
}

async function handleProgram(query: URLSearchParams, env: Env, user: SessionUser | null): Promise<Response> {
    if (query.size === 0) {
        return Response.json({
            error: 'You need to specify one query parameter.',
            parameters: {
                maxRm: 'Your max repetition',
                max90: '90% of your max repetition',
                rep85: 'How much you can push doing 5x5',
                rep90: 'How much you can push doing 5x3',
                rep95: 'How much you can push doing 5x1',
            },
        }, { status: 400 });
    }

    try {
        const result = generateBenchProgram({
            maxRm: Number(query.get('maxRm')) || undefined,
            max90: Number(query.get('max90')) || undefined,
            rep85: Number(query.get('rep85')) || undefined,
            rep90: Number(query.get('rep90')) || undefined,
            rep95: Number(query.get('rep95')) || undefined,
        });

        if (user) {
            await appendHistory(env, user.sub, result);
        }

        return Response.json(result);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'invalid_input';

        return Response.json({ error: message }, { status: 400 });
    }
}

async function route(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === '/favicon.ico') {
        return handleFavicon();
    }

    if (path === '/manifest.webmanifest') {
        return handleManifest();
    }

    if (path === '/sw.js') {
        return handleServiceWorker();
    }

    if (path === '/icon.svg') {
        return handleIcon();
    }

    if (path === '/api/auth/signup' && request.method === 'POST') {
        return handleSignup(request, env);
    }

    if (path === '/api/auth/login' && request.method === 'POST') {
        return handleLogin(request, env);
    }

    if (path === '/api/auth/refresh' && request.method === 'POST') {
        return handleRefresh(request, env);
    }

    if (path === '/api/auth/logout' && request.method === 'POST') {
        return handleLogout();
    }

    if (path === '/api/auth/me') {
        const user = await getUserFromRequest(request, env);

        return handleMe(user);
    }

    if (path === '/api/history/import' && request.method === 'POST') {
        const user = await getUserFromRequest(request, env);

        return handleImport(request, env, user);
    }

    if (path === '/api/history') {
        const user = await getUserFromRequest(request, env);

        return handleHistory(env, user);
    }

    if (path === '/api/program') {
        const user = await getUserFromRequest(request, env);

        return handleProgram(url.searchParams, env, user);
    }

    return handlePage();
}

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        const response = await route(request, env);

        return applySecurityHeaders(response);
    },

    async scheduled(_controller: ScheduledController, env: Env): Promise<void> {
        await pruneExpiredRates(env, Date.now());
    },
};
