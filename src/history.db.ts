import { Program } from './types/program.type';

const HISTORY_LIMIT = 20;

export interface HistoryEntry {
    program: Program;
    createdAt: string;
}

interface HistoryRow {
    program: string;
    created_at: string;
}

export const getHistory = async (env: Env, userId: string): Promise<HistoryEntry[]> => {
    const result = await env.DB.prepare('SELECT program, created_at FROM history WHERE user_id = ? ORDER BY created_at DESC LIMIT ?')
        .bind(userId, HISTORY_LIMIT)
        .all<HistoryRow>();

    return (result.results ?? []).map((row) => ({
        program: JSON.parse(row.program) as Program,
        createdAt: row.created_at,
    }));
};

export const appendHistory = async (env: Env, userId: string, program: Program): Promise<void> => {
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    await env.DB.prepare('INSERT INTO history (id, user_id, program, created_at) VALUES (?, ?, ?, ?)')
        .bind(id, userId, JSON.stringify(program), createdAt)
        .run();
};

export const importHistory = async (env: Env, userId: string, entries: HistoryEntry[]): Promise<void> => {
    for (const entry of entries) {
        const id = crypto.randomUUID();

        await env.DB.prepare('INSERT INTO history (id, user_id, program, created_at) VALUES (?, ?, ?, ?)')
            .bind(id, userId, JSON.stringify(entry.program), entry.createdAt)
            .run();
    }
};
