import { Program } from './types/program.type';

const HISTORY_KEY = 'history';
const HISTORY_LIMIT = 20;

export interface HistoryEntry {
    program: Program;
    createdAt: string;
}

export const getHistory = async (env: Env): Promise<HistoryEntry[]> => {
    const stored = await env.LATEST_VALUE.get(HISTORY_KEY);

    if (!stored) {
        return [];
    }

    return JSON.parse(stored) as HistoryEntry[];
};

export const appendHistory = async (env: Env, program: Program): Promise<HistoryEntry[]> => {
    const current = await getHistory(env);

    const entry: HistoryEntry = {
        program,
        createdAt: new Date().toISOString(),
    };

    const next = [entry, ...current].slice(0, HISTORY_LIMIT);

    await env.LATEST_VALUE.put(HISTORY_KEY, JSON.stringify(next));

    return next;
};
