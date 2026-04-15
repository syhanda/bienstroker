import { getDb } from "./db";

export async function insertPemasukan(data) {
    const db = await getDb();

    try {
        await db.execAsync('BEGIN TRANSACTION');

        const result = await db.runAsync(
            'INSERT INTO pemasukan (tanggal) VALUES (?)',
            data.tanggal
        );
        const pemasukanId = result.lastInsertRowId;

        for (const item of data.items) {
            await db.runAsync(
                'INSERT INTO pemasukan_item (bahan_id, pemasukan_id, jumlah) VALUES (?, ?, ?)',
                [item.bahanId, pemasukanId, item.jumlah]
            );
            await db.runAsync(
                'UPDATE bahan SET stok = stok + ? WHERE id = ?',
                [item.jumlah, item.bahanId]
            );
        }

        await db.execAsync('COMMIT');
        return true;
    } catch (e) {
        await db.execAsync('ROLLBACK'); // ✅ rollback kalau gagal
        console.error('Error insert pemasukan:', e);
        return false;
    }
}

export async function getAllPemasukan() {
    const db = await getDb();
    try {
        const result = await db.getAllAsync(
            `SELECT p.id, p.tanggal, SUM(pi.jumlah) AS total 
             FROM pemasukan_item pi 
             JOIN pemasukan p ON pi.pemasukan_id = p.id 
             GROUP BY p.id, p.tanggal 
             ORDER BY p.tanggal DESC`
        );
        return result ?? [];
    } catch (e) {
        console.error('Error getAllPemasukan:', e);
        return [];
    }
}

export async function getPemasukanDetail(id) {
    const db = await getDb();

    try {
        const result = await db.getAllAsync(
            `SELECT p.tanggal, b.nama, b.satuan, pi.jumlah 
             FROM pemasukan p 
             JOIN pemasukan_item pi ON p.id = pi.pemasukan_id 
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
        console.error('Error get peamasukan detail:', e);
        return null;
    }
}

export async function getAllPemasukanDetail() {
    const db = await getDb();
    try {
        const result = await db.getAllAsync(
            `SELECT p.id, p.tanggal, pi.id as item_id, pi.bahan_id, pi.jumlah 
             FROM pemasukan p 
             LEFT JOIN pemasukan_item pi ON p.id = pi.pemasukan_id`
        );
        return result ?? [];
    } catch (e) {
        console.error('Error getAllPemasukanDetail:', e);
        return [];
    }
}