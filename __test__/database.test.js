import * as SQLite from 'expo-sqlite';
import { insertPemakaian } from '../src/database/pemakaian';
import { insertBahan } from '../src/database/bahan';

describe("database integration test", () => {
    let db;

    beforeEach(async () => {
        db = await SQLite.openDatabaseAsync(':memory:');
        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS bahan (id INTEGER PRIMARY KEY AUTOINCREMENT, nama TEXT NOT NULL, stok INTEGER DEFAULT 0, min_stok INTEGER DEFAULT 0);
            CREATE TABLE IF NOT EXISTS pemakaian (id INTEGER PRIMARY KEY AUTOINCREMENT, tanggal TEXT);    
            CREATE TABLE IF NOT EXISTS pemakaian_item (id INTEGER PRIMARY KEY AUTOINCREMENT, bahan_id INTEGER NOT NULL, pemakaian_id INTEGER NOT NULL, jumlah INTEGER NOT NULL, CONSTRAINT fk_bahan FOREIGN KEY (bahan_id) REFERENCES bahan (id) ON DELETE CASCADE, CONSTRAINT fk_pemakaian FOREIGN KEY (pemakaian_id) REFERENCES pemakaian (id) ON DELETE CASCADE);    
        `);
    });

    it("should insert bahan correctly", async () => {
        const nama = "Kopi";
        const minStok = 10;

        await insertBahan(nama, minStok);

        const result = await db.getFirstAsync('SELECT * FROM bahan WHERE nama = ?', nama);

        expect(result.length).toBe(1);
        expect(result[0].nama).toBe(nama);
        expect(result[0].min_stok).toBe(minStok);
    });

    it("should insert pemakaian with items correctly", async () => {
        const nama = "Gula";
        const minStok = 20;

        await insertBahan(nama, minStok);

        const bahanResult = await db.getFirstAsync('SELECT * FROM bahan WHERE nama = ?', nama);

        const dataPemakaian = {
            tanggal: "2026-03-07",
            items: [
                {bahanId: bahanResult[0].id, jumlah: 5},
            ]
        };

        await insertPemakaian(dataPemakaian);

        const pemakaianResult = await db.getAllAsync('SELECT * FROM pemakaian');
        const pemakaianItemResult = await db.getAllAsync('SELECT * FROM pemakaian_item');

        expect(pemakaianResult.length).toBe(1);
        expect(pemakaianResult[0].tanggal).toBe(dataPemakaian.tanggal);

        expect(pemakaianItemResult.length).toBe(1);
        expect(pemakaianItemResult[0].bahan_id).toBe(dataPemakaian.items[0].bahanId);
        expect(pemakaianItemResult[0].jumlah).toBe(dataPemakaian.items[0].jumlah);
    });
});