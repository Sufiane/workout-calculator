import { generateBenchProgram } from './service';
import { appendHistory, getHistory } from './history.db';
import { PAGE_HTML } from './page';

const handlePage = (): Response => {
    return new Response(PAGE_HTML, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
};

const handleFavicon = (): Response => {
    return new Response(null, { status: 204 });
};

const handleHistory = async (env: Env): Promise<Response> => {
    const history = await getHistory(env);

    return Response.json(history);
};

const handleProgram = async (query: URLSearchParams, env: Env): Promise<Response> => {
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

        await appendHistory(env, result);

        return Response.json(result);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'invalid_input';

        return Response.json({ error: message }, { status: 400 });
    }
};

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        const url = new URL(request.url);

        if (url.pathname === '/favicon.ico') {
            return handleFavicon();
        }

        if (url.pathname === '/api/history') {
            return handleHistory(env);
        }

        if (url.pathname === '/api/program') {
            return handleProgram(url.searchParams, env);
        }

        return handlePage();
    },
};
