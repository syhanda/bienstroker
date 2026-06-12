import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getPemasukanDetail, getPemasukanByDate } from '../../database/pemasukan';

// Deteksi Layar Tablet
const { width } = Dimensions.get('window');
const isTablet = width > 600;

const COLORS = {
    primary: '#10B981',      // Emerald Green
    primaryLight: '#F0FDFA', // Background Mint
    textDark: '#064E3B',     // Hijau Gelap
    white: '#FFFFFF',
    border: '#E2E8F0',
    slate: '#64748B',
    headerTable: '#064E3B'   // Hijau sangat gelap untuk header
};

export default function DetailStokMasukScreen({ route }) {
    const { id, tanggal } = route.params ?? {};
    const [stokMasukData, setStokMasukData] = useState({ items: [] });

    useEffect(() => {
        let isActive = true;

        async function loadData() {
            let result;
            if (tanggal) {
                result = await getPemasukanByDate(tanggal);
            } else {
                result = await getPemasukanDetail(id);
            }

            if (isActive) setStokMasukData(result ?? { items: [] });
        }

        loadData();
        return () => {
            isActive = false;
        }
    }, []);

    const TableRow = ({ item, isHeader }) => (
        <View style={[styles.tableRow, isHeader && styles.tableHeaderBg]}>
            <View style={[styles.cell, styles.colNama, styles.borderRightCell]}>
                <Text style={[styles.cellText, isHeader && styles.headerText]}>
                    {item.bahan_nama}
                </Text>
            </View>
            <View style={[styles.cell, styles.colJumlah, styles.borderRightCell]}>
                <Text style={[styles.cellText, isHeader && styles.headerText]}>
                    {item.jumlah}
                </Text>
            </View>
            <View style={[styles.cell, styles.colSatuan]}>
                <Text style={[styles.cellText, isHeader && styles.headerText]}>
                    {item.satuan}
                </Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* --- 1. HEADER CARD --- */}
                <View style={styles.headerCard}>
                    <View style={styles.headerLeft}>
                        <View style={styles.iconBox}>
                            <MaterialCommunityIcons name="clipboard-text-clock-outline" size={isTablet ? 32 : 26} color={COLORS.primary} />
                        </View>
                        <View>
                            <Text style={styles.headerTitle}>Detail Stok Masuk</Text>
                        </View>
                    </View>
                    <View style={styles.dateBadge}>
                        <MaterialCommunityIcons name="calendar" size={16} color={COLORS.primary} />
                        <Text style={styles.headerDate}>{stokMasukData.tanggal}</Text>
                    </View>
                </View>

                {/* --- 2. TABEL DATA --- */}
                <View style={styles.tableWrapper}>
                    <View style={styles.tableContainer}>
                        {/* Header Tabel */}
                        <TableRow
                            item={{ bahan_nama: 'NAMA BARANG', jumlah: 'JUMLAH', satuan: 'SATUAN' }}
                            isHeader={true}
                        />

                        {/* Isi Tabel */}
                        {stokMasukData.items?.map((item, index) => (
                            <TableRow
                                key={index}
                                item={item}
                                isHeader={false}
                            />
                        ))}
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.primaryLight,
    },
    scrollContent: {
        paddingVertical: isTablet ? 40 : 0,
        alignSelf: 'center',
        width: '100%',
        maxWidth: isTablet ? 900 : '100%',
    },

    // --- Header Card Style ---
    headerCard: {
        flexDirection: isTablet ? 'row' : 'column',
        justifyContent: 'space-between',
        alignItems: isTablet ? 'center' : 'flex-start',
        backgroundColor: COLORS.white,
        marginHorizontal: 20,
        padding: 20,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: COLORS.border,
        elevation: 10,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        marginBottom: 30,
        gap: isTablet ? 0 : 15,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBox: {
        width: isTablet ? 60 : 50,
        height: isTablet ? 60 : 50,
        backgroundColor: COLORS.primaryLight,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    headerTitle: {
        fontSize: isTablet ? 24 : 20,
        fontWeight: '900',
        color: COLORS.textDark,
    },
    headerSubtitle: {
        fontSize: 14,
        color: COLORS.slate,
        fontWeight: '500',
    },
    dateBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primaryLight,
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 12,
        gap: 8,
    },
    headerDate: {
        fontSize: isTablet ? 16 : 14,
        color: COLORS.textDark,
        fontWeight: 'bold',
    },

    // --- Table Style ---
    tableWrapper: {
        paddingHorizontal: 20,
    },
    tableContainer: {
        borderRadius: 20,
        overflow: 'hidden', // Agar border-radius memotong row
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.white,
        elevation: 3,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: COLORS.primaryLight,
    },
    tableHeaderBg: {
        backgroundColor: COLORS.headerTable,
        borderBottomWidth: 0,
    },
    cell: {
        paddingVertical: isTablet ? 18 : 14,
        paddingHorizontal: 12,
        justifyContent: 'center',
    },
    borderRightCell: {
        borderRightWidth: 1,
        borderColor: COLORS.primaryLight,
    },
    cellText: {
        fontSize: isTablet ? 16 : 14,
        color: COLORS.textDark,
    },
    headerText: {
        color: COLORS.white,
        fontWeight: '800',
        fontSize: 12,
        letterSpacing: 1,
    },

    // --- Column Widths ---
    colNama: { flex: 2.5 },
    colJumlah: { flex: 1, alignItems: 'center' },
    colSatuan: { flex: 1, alignItems: 'center' },
});
