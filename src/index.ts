import { generateBenchProgram } from './service';

const handleProgram = async (query: URLSearchParams, env: Env): Promise<Response> => {
    const result = generateBenchProgram({
        maxRm: Number(query.get('maxRm')) || undefined,
        max90: Number(query.get('max90')) || undefined,
        rep85: Number(query.get('rep85')) || undefined,
        rep90: Number(query.get('rep90')) || undefined,
        rep95: Number(query.get('rep95')) || undefined,
    });

    await env.LATEST_VALUE.put('latest', JSON.stringify(result));

    return Response.json(result);
};

const handleFavicon = (): Response => {
    return new Response(null, { status: 204 });
};

const handleLatest = async (env: Env): Promise<Response> => {
    const value = await env.LATEST_VALUE.get('latest');

    return Response.json(value ? JSON.parse(value) : 'no_latest_recorded');
};

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        const url = new URL(request.url);

        if (url.pathname === '/favicon.ico') {
            return handleFavicon();
        }

        if (url.pathname === '/latest') {
            return handleLatest(env);
        }

        const query = url.searchParams;

        if (query.size === 0) {
            return Response.json({
                instructions: 'You need to specify the query parameters.',
                parameters: {
                    maxRm: 'Your max repetition',
                    max90: '90% of your max repetition',
                    rep85: 'How much you can push doing 5x5. The load you can push at 85% of your 95% of your max 90. ie: ',
                    rep90: 'How much you can push doing 5x3rep',
                    rep95: 'How much you can push doing 5x1rep',
                },
            });
        }

        return handleProgram(query, env);
    },
};
