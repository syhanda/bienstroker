import React, { useState, useCallback, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    FlatList, Alert, Dimensions
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { getDb } from '../../database/db';
import DropdownComponent from '../../components/DropdownComponent';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const isTablet = width > 600;

const COLORS = {
    primary: '#10B981',      // Emerald Green
    primaryLight: '#F0FDFA', // Background Mint
    textDark: '#064E3B',     // Hijau Gelap
    white: '#FFFFFF',
    danger: '#EF4444',       // Merah stok keluar
    border: '#E2E8F0',
    slate: '#64748B',
};

const dataBulan = [
    { label: 'JANUARI', value: '01' }, { label: 'FEBRUARI', value: '02' },
    { label: 'MARET', value: '03' }, { label: 'APRIL', value: '04' },
    { label: 'MEI', value: '05' }, { label: 'JUNI', value: '06' },
    { label: 'JULI', value: '07' }, { label: 'AGUSTUS', value: '08' },
    { label: 'SEPTEMBER', value: '09' }, { label: 'OKTOBER', value: '10' },
    { label: 'NOVEMBER', value: '11' }, { label: 'DESEMBER', value: '12' },
];

export default function LaporanScreen() {
    const [bulan, setBulan] = useState(('0' + (new Date().getMonth() + 1)).slice(-2)); // Default current month
    const [tahun, setTahun] = useState(new Date().getFullYear().toString()); // Default current year
    const [dataLaporan, setDataLaporan] = useState([]);
    const isFetchingRef = React.useRef(false);

    const tahunSekarang = new Date().getFullYear();

    // Membuat array 5 tahun terakhir
    const dataTahun = Array.from({ length: 5 }, (_, i) => {
        const tahun = (tahunSekarang - i).toString();
        return { label: tahun, value: tahun };
    });

    // Gabungkan bulan dan tahun untuk query SQL (format YYYY-MM)
    const periodeLaporan = `${tahun}-${bulan}`;

    useFocusEffect(
        useCallback(() => {
            let isActive = true;

            const fetchLaporan = async () => {
                if (isFetchingRef.current) return;
                isFetchingRef.current = true;

                const db = await getDb();
                try {
                    const data = await db.getAllAsync(`
                        SELECT 
                            b.id,
                            b.nama,
                            b.satuan,
                            b.stok,
                            b.min_stok,
                            COALESCE(SUM(masuk.jumlah), 0) AS total_pemasukan,
                            COALESCE(SUM(keluar.jumlah), 0) AS total_pemakaian
                        FROM bahan b
                        LEFT JOIN (
                            SELECT pi.bahan_id, pi.jumlah 
                            FROM pemasukan_item pi 
                            JOIN pemasukan p ON pi.pemasukan_id = p.id 
                            WHERE strftime('%Y-%m', p.tanggal) = ?
                        ) masuk ON b.id = masuk.bahan_id
                        LEFT JOIN (
                            SELECT pei.bahan_id, pei.jumlah_pemakaian AS jumlah 
                            FROM pemakaian_item pei 
                            JOIN pemakaian p ON pei.pemakaian_id = p.id 
                            WHERE strftime('%Y-%m', p.tanggal) = ?
                        ) keluar ON b.id = keluar.bahan_id
                        GROUP BY b.id, b.nama
                        HAVING total_pemasukan > 0 OR total_pemakaian > 0
                        ORDER BY b.nama ASC`,
                        periodeLaporan, periodeLaporan
                    );

                    if (isActive) {
                        setDataLaporan(data);
                    }
                } catch (err) {
                    console.error('fetchLaporan error', err);
                } finally {
                    if (isActive) isFetchingRef.current = false;
                }
            };

            fetchLaporan();
            return () => { isActive = false; isFetchingRef.current = false; };
        }, [periodeLaporan])
    );

    const getNamaBulan = (angkaBulan) => {
      const bulanIndo = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
      ];
      return bulanIndo[parseInt(angkaBulan) - 1];
    };

const cetakPDF = async () => {
    const tableRows = dataLaporan.map((item, index) => `
        <tr>
            <td style="text-align:center">${index + 1}</td>
            <td>${item.nama}</td>
            <td style="text-align:center">${item.satuan || '-'}</td>
            <td style="text-align:center">${(item.stok + item.total_pemasukan + item.total_pemakaian) ?? 0}</td>
            <td style="text-align:center">${item.stok ?? 0}</td>
            <td style="text-align:center; color: #10B981; font-weight: bold;">${item.total_pemasukan}</td>
            <td style="text-align:center; color: #EF4444; font-weight: bold;">${item.total_pemakaian}</td>
        </tr>
    `).join('');

    const htmlContent = `
        <html>
            <head>
                <style>
                    body { font-family: 'Helvetica', 'Arial', sans-serif; color: #333; padding: 20px; }
                    .header { text-align: center; margin-bottom: 30px; border-bottom: 3px double #10B981; padding-bottom: 20px; }
                    .cafe-name { font-size: 28px; font-weight: 900; color: #064E3B; margin: 0; text-transform: uppercase; letter-spacing: 2px; }
                    .title { font-size: 18px; font-weight: bold; margin: 10px 0 5px 0;}
                    .address { font-size: 12px; color: #64748B; margin: 2px 0; }
                    .contact { font-size: 11px; color: #64748B; margin-top: 5px; font-style: italic; }

                    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                    th { background-color: #10B981; color: white; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; padding: 12px 8px; border: 1px solid #064E3B; }
                    td { border: 1px solid #E2E8F0; padding: 10px 8px; font-size: 11px; color: #334155; }
                    tr:nth-child(even) { background-color: #F8FAFC; }

                    .footer-date { text-align: right; font-size: 12px; color: #94A3B8; margin-top: 35px; white-space: nowrap; }
                </style>
            </head>
            <body>
                <div class="header">
                    <p class="title">LAPORAN STOK INVENTORI - ${getNamaBulan(bulan)} ${tahun}</p>
                    <h1 class="cafe-name">CAFE BIEN</h1>
                    <p class="address">Alamat: Jl. Jendral Sudirman No. 38, Metro Pusat, Kota Metro.</p>
                    <p class="contact">
                        No. Telp: 085159411464 | Email: houseofbien@gmail.com | Instagram: @houseofbien
                    </p>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th style="width: 5%">No</th>
                            <th style="width: 30%">Nama Barang</th>
                             <th style="width: 10%">Satuan</th>
                             <th style="width: 15%">Total Stok</th>
                             <th style="width: 15%">Sisa Stok</th>
                             <th style="width: 12.5%">Masuk</th>
                             <th style="width: 12.5%">Keluar</th>
                        </tr>
                    </thead>
                    <tbody>${tableRows}</tbody>
                </table>

                <div class="footer-date">
                    Tanggal Laporan Dibuat: ${new Date().toLocaleString('id-ID')}
                </div>
            </body>
        </html>
    `;

    try {
        const { uri } = await Print.printToFileAsync({ html: htmlContent });
        await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (error) {
        Alert.alert("Gagal", "Tidak bisa membuat PDF sesuai template.");
    }
};

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.contentWrapper}>

                {/* --- 1. FILTER PERIODE --- */}
                <View style={styles.periodCard}>
                    <View style={styles.periodHeader}>
                        <MaterialCommunityIcons name="calendar-search" size={20} color={COLORS.primary} />
                        <Text style={styles.labelHeader}>Periode Laporan</Text>
                    </View>
                    <View style={styles.dropdownRow}>
                        <View style={styles.dropdownWrapper}>
                            <DropdownComponent
                                data={dataBulan}
                                value={bulan}
                                onChange={setBulan}
                                placeholder="Bulan"
                                style={styles.filterDropdown}
                                styleSelectedText={styles.selectedTextFilter}
                            />
                        </View>
                        <View style={styles.dropdownWrapper}>
                            <DropdownComponent
                                data={dataTahun}
                                value={tahun}
                                onChange={setTahun}
                                placeholder="Tahun"
                                style={styles.filterDropdown}
                                styleSelectedText={styles.selectedTextFilter}
                            />
                        </View>
                    </View>
                </View>

                {/* --- 2. TABEL LAPORAN --- */}
                <View style={styles.tableHeader}>
                    <Text style={[styles.tableHeaderText, { flex: .5 }]}>No</Text>
                    <Text style={[styles.tableHeaderText, { flex: 2 }]}>Nama Bahan</Text>
                    <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>Total Stok</Text>
                    <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>Sisa Stok</Text>
                    <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>Masuk</Text>
                    <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>Keluar</Text>
                </View>

                <FlatList
                    data={dataLaporan}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <MaterialCommunityIcons name="database-off-outline" size={60} color={COLORS.border} />
                            <Text style={styles.emptyText}>Tidak ada data pada periode ini.</Text>
                        </View>
                    }
                    renderItem={({ item, index }) => (
                        <View style={styles.tableRow}>
                            <Text style={[styles.tableRowText, { flex: .5, fontWeight: 'bold', color: COLORS.textDark }]} numberOfLines={2}>
                                {index + 1}
                            </Text>
                            <Text style={[styles.tableRowText, { flex: 2, fontWeight: 'bold', color: COLORS.textDark }]} numberOfLines={2}>
                                {item.nama}
                            </Text>
                            <Text style={[styles.tableRowText, { flex: 1, textAlign: 'center', color: COLORS.textDark }]}>
                                {(item.stok + item.total_pemasukan + item.total_pemakaian) ?? 0}
                            </Text>
                            <Text style={[styles.tableRowText, { flex: 1, textAlign: 'center', color: COLORS.textDark }]}>
                                {item.stok ?? 0}
                            </Text>
                            <Text style={[styles.tableRowText, styles.valIn, { flex: 1, textAlign: 'center' }]}>
                                +{item.total_pemasukan}
                            </Text>
                            <Text style={[styles.tableRowText, styles.valOut, { flex: 1, textAlign: 'center' }]}>
                                -{item.total_pemakaian}
                            </Text>
                        </View>
                    )}
                />

                {/* --- 3. TOMBOL CETAK PDF --- */}
                <View style={styles.footer}>
                    <TouchableOpacity style={styles.btnCetak} onPress={cetakPDF} activeOpacity={0.8}>
                        <MaterialCommunityIcons name="file-pdf-box" size={24} color="white" />
                        <Text style={styles.btnText}>UNDUH</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.primaryLight,
    },
    contentWrapper: {
        flex: 1,
        paddingHorizontal: isTablet ? 40 : 20,
        alignSelf: 'center',
        width: '100%',
        maxWidth: 900,
    },
    periodCard: {
        backgroundColor: COLORS.white,
        borderRadius: 25,
        padding: 13,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: COLORS.border,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    periodHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        gap: 8,
    },
    labelHeader: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.textDark,
    },
    dropdownRow: {
        flexDirection: 'row',
        gap: 12,
    },
    dropdownWrapper: {
        flex: 1,
    },
    filterDropdown: {
        height: 40,
        borderRadius: 12
    },
    selectedTextFilter: {
        fontSize: 13
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: COLORS.primary,
        padding: 15,
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
        marginTop: 10,
    },
    tableHeaderText: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: isTablet ? 14 : 11,
    },
    tableRow: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        alignItems: 'center',
    },
    tableRowText: {
        fontSize: isTablet ? 14 : 11,
    },
    valIn: {
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    valOut: {
        color: COLORS.danger,
        fontWeight: 'bold',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 60,
    },
    emptyText: {
        marginTop: 10,
        color: COLORS.slate,
        fontStyle: 'italic',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        backgroundColor: COLORS.primaryLight,
    },
    btnCetak: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        height: 60,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'flex-end',
        width: '100%',
        maxWidth: isTablet ? 150 : '100%',
        elevation: 8,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    btnText: {
        color: 'white',
        fontSize: 15,
        fontWeight: 'bold',
        marginLeft: 10,
        letterSpacing: 0.5,
    },
});