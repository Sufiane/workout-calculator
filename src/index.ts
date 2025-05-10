import {
    calculateFromMax90,
    calculateFromMaxRm,
    calculateFromRep85,
    calculateFromRep90,
    calculateFromRep95,
} from './service';

const generateBenchProgram = ({
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
}) => {
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
    }
};

const handleProgram = async (query: URLSearchParams, env: Env): Promise<Response> => {
    const result = generateBenchProgram({
        maxRm: Number(query.get('maxRm')) || undefined,
        max90: Number(query.get('max90')) || undefined,
        rep85: Number(query.get('rep85')) || undefined,
        rep90: Number(query.get('rep90')) || undefined,
        rep95: Number(query.get('rep95')) || undefined,
    });

    await env.LATEST_VALUE.put('latest', JSON.stringify(result))

    return Response.json(result);
}

const handleFavicon = (): Response => {
    return new Response(null, { status: 204 });
}

const handleLatest = async (env: Env): Promise<Response> => {
    const value = await env.LATEST_VALUE.get('latest');

    return Response.json(value ? JSON.parse(value) : 'no_latest_recorded');
}

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        const url = new URL(request.url);

        if (url.pathname === '/favicon.ico') {
            return handleFavicon()
        }

        if (url.pathname === '/latest') {
            return handleLatest(env);
        }

        const query = url.searchParams;

        return handleProgram(query, env)
    },
};
