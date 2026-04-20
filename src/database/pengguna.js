import { getDb } from "./db";

export async function getUserByUsername(username) {
    const db = await getDb();
    try {
        return await db.getFirstAsync(`SELECT * FROM pengguna WHERE username = ?`, username);
    } catch (error) {
        console.error('Error fetching pengguna using username:', error);
        return null;
    }
}

export async function seed() {
    const db = await getDb();

    try {
        const result = await db.execAsync(
            `INSERT OR IGNORE INTO pengguna (username, password, level) VALUES ('administrator', 'admin123', 'admin');
            INSERT OR IGNORE INTO pengguna (username, password, level) VALUES ('owner', 'owner123', 'owner');`
        );
        return result;
    } catch (error) {
        console.log('error seeding user: ', error);
        return null;
    }
}