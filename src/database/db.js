import * as SQLite from 'expo-sqlite';

let dbInstance = null;

export const getDb = async () => {
    if (dbInstance) return dbInstance;
    dbInstance = await SQLite.openDatabaseAsync('invenApp.db');
    return dbInstance;
};

export const initDb = async () => {
    try {
        const db = await getDb();

        await db.execAsync(`PRAGMA foreign_keys = ON;`);

        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS pengguna (
                id INTEGER PRIMARY KEY AUTOINCREMENT, 
                username TEXT UNIQUE,
                password TEXT,
                level TEXT,
                created_at TEXT DEFAULT (datetime('now','localtime'))
            );
            CREATE TABLE IF NOT EXISTS bahan (
                id INTEGER PRIMARY KEY AUTOINCREMENT, 
                nama TEXT,
                satuan TEXT,
                stok INTEGER DEFAULT 0, 
                min_stok INTEGER DEFAULT 0,
                gambar TEXT
            );
            CREATE TABLE IF NOT EXISTS pemakaian (
                id INTEGER PRIMARY KEY AUTOINCREMENT, 
                tanggal TEXT
            );
            CREATE TABLE IF NOT EXISTS pemakaian_item (
                id INTEGER PRIMARY KEY AUTOINCREMENT, 
                bahan_id INTEGER NOT NULL, 
                pemakaian_id INTEGER NOT NULL, 
                jumlah_pemakaian INTEGER NOT NULL,
                CONSTRAINT fk_bahan FOREIGN KEY (bahan_id) REFERENCES bahan (id) ON DELETE CASCADE, 
                CONSTRAINT fk_pemakaian FOREIGN KEY (pemakaian_id) REFERENCES pemakaian (id) ON DELETE CASCADE
            );
            CREATE TABLE IF NOT EXISTS pemasukan (
                id INTEGER PRIMARY KEY AUTOINCREMENT, 
                tanggal TEXT
            );
            CREATE TABLE IF NOT EXISTS pemasukan_item (
                id INTEGER PRIMARY KEY AUTOINCREMENT, 
                bahan_id INTEGER, 
                pemasukan_id INTEGER NOT NULL, 
                jumlah INTEGER NOT NULL,
                CONSTRAINT fk_bahan FOREIGN KEY (bahan_id) REFERENCES bahan (id) ON DELETE CASCADE, 
                CONSTRAINT fk_pemasukan FOREIGN KEY (pemasukan_id) REFERENCES pemasukan (id) ON DELETE CASCADE
            );
        `);

        // Migration: Rename 'jumlah' to 'jumlah_pemakaian' if it still exists in pemakaian_item
        try {
            const tableInfo = await db.getAllAsync(`PRAGMA table_info(pemakaian_item)`);
            const hasJumlah = tableInfo.some(col => col.name === 'jumlah');
            const hasJumlahPemakaian = tableInfo.some(col => col.name === 'jumlah_pemakaian');

            if (hasJumlah && !hasJumlahPemakaian) {
                await db.execAsync(`ALTER TABLE pemakaian_item RENAME COLUMN jumlah TO jumlah_pemakaian`);
                console.log('Migration: Renamed jumlah to jumlah_pemakaian in pemakaian_item');
            }
        } catch (migrationError) {
            console.error('Migration error:', migrationError);
        }

        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
};