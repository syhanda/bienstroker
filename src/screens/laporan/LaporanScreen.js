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

const dataBulan = [
    { label: 'JANUARI', value: '01' }, { label: 'FEBRUARI', value: '02' },
    { label: 'MARET', value: '03' }, { label: 'APRIL', value: '04' },
    { label: 'MEI', value: '05' }, { label: 'JUNI', value: '06' },
    { label: 'JULI', value: '07' }, { label: 'AGUSTUS', value: '08' },
    { label: 'SEPTEMBER', value: '09' }, { label: 'OKTOBER', value: '10' },
    { label: 'NOVEMBER', value: '11' }, { label: 'DESEMBER', value: '12' },
];

export default function LaporanScreen() {
    const [bulan, setBulan] = useState(('0' + (new Date().getMonth() + 1)).slice(-2)); // Default Maret
    const [tahun, setTahun] = useState(new Date().getFullYear().toString()); // Default 2026
    const [dataLaporan, setDataLaporan] = useState([]);
    const [total, setTotal] = useState({ masuk: 0, keluar: 0 });
    const isFetchingRef = React.useRef(false);

    const tahunSekarang = new Date().getFullYear();

    // Membuat array 5 tahun terakhir (2026, 2025, 2024, 2023, 2022)
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
                        SELECT tanggal, SUM(pemakaian) AS total_pemakaian, SUM(pemasukan) AS total_pemasukan FROM (
                            SELECT p.tanggal, pi.jumlah AS pemasukan, 0 AS pemakaian FROM pemasukan p JOIN pemasukan_item pi ON p.id = pi.pemasukan_id WHERE strftime('%Y-%m', p.tanggal) = ?
                            UNION ALL
                            SELECT p.tanggal, 0 AS pemasukan, pi.jumlah AS pemakaian FROM pemakaian p JOIN pemakaian_item pi ON p.id = pi.pemakaian_id WHERE strftime('%Y-%m', p.tanggal) = ?
                        ) AS gabungan GROUP BY tanggal ORDER BY tanggal ASC`, 
                        periodeLaporan, periodeLaporan
                    );

                    if (isActive) {
                        setDataLaporan(data);
                        setTotal({
                            masuk: data.reduce((sum, item) => sum + item.total_pemasukan, 0),
                            keluar: data.reduce((sum, item) => sum + item.total_pemakaian, 0)
                        });
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

    const cetakPDF = async () => {
        const tableRows = dataLaporan.map((item, index) => `
            <tr>
                <td style="text-align:center">${index + 1}</td>
                <td>${item.tanggal}</td>
                <td style="text-align:right">${item.total_pemasukan}</td>
                <td style="text-align:right">${item.total_pemakaian}</td>
            </tr>
        `).join('');

        const htmlContent = `
            <html>
                <head>
                    <style>
                        body { font-family: sans-serif; padding: 40px; }
                        .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #000; padding: 10px; text-align: left; }
                        th { background-color: #f2f2f2; }
                        .summary { margin-top: 30px; }
                        .summary-text { font-size: 18px; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>LAPORAN STOK BIENSTROKER</h1>
                        <p>Periode: ${bulan}/${tahun}</p>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>Tanggal</th>
                                <th>Total Masuk</th>
                                <th>Total Keluar</th>
                            </tr>
                        </thead>
                        <tbody>${tableRows}</tbody>
                    </table>
                    <div class="summary">
                        <p class="summary-text">Total Masuk: ${total.masuk}</p>
                        <p class="summary-text">Total Keluar: ${total.keluar}</p>
                    </div>
                </body>
            </html>
        `;

        try {
            const { uri } = await Print.printToFileAsync({ html: htmlContent });
            await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
        } catch (error) {
            Alert.alert("Gagal", "Tidak bisa membuat PDF");
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.contentWrapper}>
                {/* FILTER PERIODE DENGAN CUSTOMDROPDOWN */}
                <View style={styles.periodCard}>
                    <Text style={styles.labelHeader}>Periode Laporan:</Text>
                    <View style={styles.dropdownRow}>
                        <View style={styles.dropdownWrapper}>
                            <DropdownComponent 
                                data={dataBulan}
                                value={bulan}
                                onChange={setBulan}
                                placeholder="Bulan"
                            />
                        </View>
                        <View style={styles.dropdownWrapper}>
                            <DropdownComponent 
                                data={dataTahun}
                                value={tahun}
                                onChange={setTahun}
                                placeholder="Tahun"
                            />
                        </View>
                    </View>
                </View>

                {/* RINGKASAN STATISTIK */}
                <View style={styles.statsContainer}>
                    <View style={styles.statsRow}>
                        <Text style={styles.statsLabel}>Total Masuk</Text>
                        <Text style={[styles.statsValue, { color: '#2DCE89' }]}>+{total.masuk}</Text>
                    </View>
                    {/* <View style={styles.divider} /> */}
                    <View style={styles.statsRow}>
                        <Text style={styles.statsLabel}>Total Keluar</Text>
                        <Text style={[styles.statsValue, { color: '#d33131' }]}>-{total.keluar}</Text>
                    </View>
                    <View style={styles.divider} />
                </View>

                {/* DAFTAR TRANSAKSI (Gaya Tabel/List Bergaris) */}
                <Text style={styles.detailText}>Detail</Text>
                <FlatList
                    data={dataLaporan}
                    keyExtractor={(item, index) => index.toString()}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    ListEmptyComponent={<Text style={styles.emptyText}>Tidak ada data pada periode ini.</Text>}
                    renderItem={({ item }) => (
                        <View style={styles.listItem}>
                            <Text style={styles.listDate}>{item.tanggal}</Text>
                            <View style={styles.listValueContainer}>
                                <Text style={styles.valIn}>+{item.total_pemasukan}</Text>
                                <Text style={styles.valOut}>-{item.total_pemakaian}</Text>
                            </View>
                        </View>
                    )}
                />

                {/* TOMBOL CETAK PDF */}
                <TouchableOpacity style={styles.btnCetak} onPress={cetakPDF} activeOpacity={0.8}>
                    <MaterialCommunityIcons name="file-pdf-box" size={24} color="white" />
                    <Text style={styles.btnText}>CETAK PDF</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    contentWrapper: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
        alignSelf: 'center',
        width: '100%',
        maxWidth: 750, // Menjaga layout tetap rapi di tablet
    },
    periodCard: {
        borderWidth: 1,
        borderColor: '#00B4D8',
        borderRadius: 20,
        padding: 20,
        marginBottom: 25,
        backgroundColor: 'white',
    },
    labelHeader: {
        fontSize: isTablet ? 18 : 16,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    dropdownRow: {
        flexDirection: 'row',
        gap: 12,
    },
    dropdownWrapper: {
        flex: 1,
    },
    statsContainer: {
        marginBottom: 20,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    statsLabel: {
        fontSize: isTablet ? 18 : 16,
        fontWeight: '500',
        color: '#333',
    },
    statsValue: {
        fontSize: isTablet ? 22 : 18,
        fontWeight: 'bold',
    },
    divider: {
        height: 1,
        backgroundColor: '#EEEEEE',
    },
    detailText: {
        fontSize: 16,
        color: '#95A5A6',
        marginTop: 2,
        marginBottom: 6
    },
    listItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderColor: '#F0F0F0',
    },
    listDate: {
        fontSize: 14,
        fontWeight: '600',
    },
    listValueContainer: {
        flexDirection: 'row',
        gap: 15,
    },
    valIn: {
        color: '#2DCE89',
        fontWeight: 'bold',
    },
    valOut: {
        color: '#d33131',
        fontWeight: 'bold',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 30,
        color: '#999',
    },
    btnCetak: {
        backgroundColor: '#00B4D8',
        flexDirection: 'row',
        height: 55,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 10,
        elevation: 4,
    },
    btnText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
        marginLeft: 10,
    },
});