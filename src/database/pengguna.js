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
        const result = await db.runAsync(`INSERT INTO pengguna (username, password, level) VALUES (?, ?, ?)`, 'admin', 'admin123', 'admin');
        return result;
    } catch (error) {
        console.log('error seeding user: ', error);
        return null;
    }
}