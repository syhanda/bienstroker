import { getDb } from "./db";

export async function insertPemakaian(data) {
    const db = await getDb();

    try {
        await db.execAsync('BEGIN TRANSACTION');

        const result = await db.runAsync(
            'INSERT INTO pemakaian (tanggal) VALUES (?)',
            data.tanggal
        );
        const pemakaianId = result.lastInsertRowId;

        for (const item of data.items) {
            await db.runAsync(
                'INSERT INTO pemakaian_item (bahan_id, pemakaian_id, jumlah) VALUES (?, ?, ?)',
                [item.bahanId, pemakaianId, item.jumlah]
            );
            await db.runAsync(
                'UPDATE bahan SET stok = stok - ? WHERE id = ?',
                [item.jumlah, item.bahanId]
            );
        }

        await db.execAsync('COMMIT');
        return true;
    } catch (e) {
        await db.execAsync('ROLLBACK'); // ✅ rollback kalau gagal
        console.error('Error insertPemakaian:', e);
        return false;
    }
}

export async function getAllPemakaian() {
    const db = await getDb();
    try {
        const result = await db.getAllAsync(
            `SELECT p.id, p.tanggal, SUM(pi.jumlah) AS total 
             FROM pemakaian_item pi 
             JOIN pemakaian p ON pi.pemakaian_id = p.id 
             GROUP BY p.id, p.tanggal 
             ORDER BY p.tanggal DESC`
        );
        return result ?? [];
    } catch (e) {
        console.error('Error getAllPemakaian:', e);
        return [];
    }
}

export async function getPemakaianDetail(id) {
    const db = await getDb();

    try {
        const result = await db.getAllAsync(
            `SELECT p.tanggal, b.nama, b.satuan , pi.jumlah 
             FROM pemakaian p 
             JOIN pemakaian_item pi ON p.id = pi.pemakaian_id 
             JOIN bahan b ON pi.bahan_id = b.id 
             WHERE p.id = ?`, 
            id
        );

        if (!result || result.length === 0) return null;

        return {
            tanggal: result[0].tanggal,
            items: result.map(item => ({
                bahan_nama: item.nama,
                jumlah: item.jumlah,
                satuan: item.satuan
            }))
        };
    } catch (e) {
        console.error('Error getPemakaianDetail:', e);
        return null;
    }
}

export async function getAllPemakaianDetail() {
    const db = await getDb();
    try {
        const result = await db.getAllAsync(
            `SELECT p.id, p.tanggal, pi.id as item_id, pi.bahan_id, pi.jumlah 
             FROM pemakaian p 
             LEFT JOIN pemakaian_item pi ON p.id = pi.pemakaian_id`
        );
        return result ?? [];
    } catch (e) {
        console.error('Error getAllPemakaianDetail:', e);
        return [];
    }
}