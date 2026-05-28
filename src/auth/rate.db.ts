export interface RateRow {
    key: string;
    count: number;
    reset_at: number;
}

export const getRate = async (env: Env, key: string): Promise<RateRow | null> => {
    const row = await env.DB.prepare('SELECT key, count, reset_at FROM rate_limits WHERE key = ?')
        .bind(key)
        .first<RateRow>();

    return row ?? null;
};

export const setRate = async (env: Env, key: string, count: number, resetAt: number): Promise<void> => {
    await env.DB.prepare('INSERT OR REPLACE INTO rate_limits (key, count, reset_at) VALUES (?, ?, ?)')
        .bind(key, count, resetAt)
        .run();
};
