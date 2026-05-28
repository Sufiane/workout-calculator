export interface UserRow {
    id: string;
    email: string;
    password_hash: string;
    password_salt: string;
    created_at: string;
}

export interface NewUser {
    id: string;
    email: string;
    passwordHash: string;
    passwordSalt: string;
    createdAt: string;
}

export const createUser = async (env: Env, user: NewUser): Promise<void> => {
    await env.DB.prepare('INSERT INTO users (id, email, password_hash, password_salt, created_at) VALUES (?, ?, ?, ?, ?)')
        .bind(user.id, user.email, user.passwordHash, user.passwordSalt, user.createdAt)
        .run();
};

export const findUserByEmail = async (env: Env, email: string): Promise<UserRow | null> => {
    const row = await env.DB.prepare('SELECT id, email, password_hash, password_salt, created_at FROM users WHERE email = ?')
        .bind(email)
        .first<UserRow>();

    return row ?? null;
};
