import { getDb } from "./db";

export async function getAllBahan() {
    const db = await getDb();

    try {
        return await db.getAllAsync('SELECT * FROM bahan');
    } catch (error) {
        console.error('Error fetching bahan:', error);
        return [];
    }
}

export async function getBahan(id) {
    const db = await getDb();
    try {
        return await db.getFirstAsync(`SELECT * FROM bahan WHERE id = ?`, id);
    } catch (error) {
        console.error('Error fetching bahan using id:', error);
        return null;
    }
}

export async function insertBahan(nama, satuan, minStok, gambar) {
    const db = await getDb();
    try {
        return await db.runAsync('INSERT INTO bahan (nama, satuan, min_stok, gambar) VALUES (?, ?, ?, ?)', nama, satuan, parseInt(minStok), gambar);
    } catch (error) {
        console.error('Error inserting bahan:', error);
        return null;
    }
}

export async function getBarangHabis() {
    const db = await getDb();
    try {
        return await db.getAllAsync('SELECT nama FROM bahan WHERE stok <= min_stok');
    } catch (error) {
        console.error('Error fetching barang:', error);
        return null;
    }
}

export async function updateStokBahan(data) {
    const db = await getDb();

    try {
        const formatedDate = data.tanggal.toISOString().split('T')[0];

        await db.execAsync('BEGIN TRANSACTION');

        const result = await db.runAsync(
            'INSERT INTO pemasukan (tanggal) VALUES (?)',
            formatedDate
        );
        const pemasukanId = result.lastInsertRowId;

        for (const item of data.items) {
            await db.runAsync(
                'UPDATE bahan SET stok = stok + ? WHERE id = ?',
                [item.jumlah, item.bahanId]
            );
            await db.runAsync(
                'INSERT INTO pemasukan_item (bahan_id, pemasukan_id, jumlah) VALUES (?, ?, ?)',
                [item.bahanId, pemasukanId, item.jumlah]
            );
        }

        await db.execAsync('COMMIT');
        return true;
    } catch (e) {
        await db.execAsync('ROLLBACK'); // ✅ rollback kalau gagal
        console.error('Error updateStokBahan:', e);
        return false;
    }
}

export async function updateBahan(id, nama, satuan, minStok, gambar) {
    const db = await getDb();
    try {
        return await db.runAsync('UPDATE bahan SET nama = ?, satuan = ?, min_stok = ?, gambar = ? WHERE id = ?', nama,satuan, minStok, gambar, id);
    } catch (error) {
        console.error('Error updating bahan:', error);
        return null;
    }
}

export async function deleteBahan(id) {
    const db = await getDb();
    try {
        return await db.runAsync('DELETE FROM bahan WHERE id = ?', id);
    } catch (error) {
        console.error('Error deleting bahan:', error);
        return null;
    }
}

export async function getStats() {
    const db = await getDb();

    try {
        const bulanIni = new Date().toISOString().slice(0, 7);

        const masuk = await db.getFirstAsync(
            `SELECT SUM(pemasukan_item.jumlah) as total_pemasukan 
             FROM pemasukan_item 
             JOIN pemasukan ON pemasukan_item.pemasukan_id = pemasukan.id 
             WHERE strftime('%Y-%m', pemasukan.tanggal) = ?`, 
            bulanIni
        );

        const keluar = await db.getFirstAsync(
            `SELECT SUM(pemakaian_item.jumlah) as total_pemakaian 
             FROM pemakaian_item 
             JOIN pemakaian ON pemakaian_item.pemakaian_id = pemakaian.id 
             WHERE strftime('%Y-%m', pemakaian.tanggal) = ?`, 
            bulanIni
        );

        return {
            pemasukan: { total_pemasukan: masuk?.total_pemasukan ?? 0 },
            pemakaian: { total_pemakaian: keluar?.total_pemakaian ?? 0 }
        };
    } catch (error) {
        console.error("Gagal memuat statistik:", error);
        return {
            pemasukan: { total_pemasukan: 0 },
            pemakaian: { total_pemakaian: 0 }
        };
    }
}