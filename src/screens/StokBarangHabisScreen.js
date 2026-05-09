import React, { useEffect, useState, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Dimensions,
    Alert
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getBarangHabis } from '../database/bahan';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../AuthContext';

const { width } = Dimensions.get('window');
const isTablet = width > 600;

const COLORS = {
    primary: '#10B981',      // Emerald Green
    primaryLight: '#F0FDFA', // Mint Background
    textDark: '#064E3B',     // Hijau Gelap
    white: '#FFFFFF',
    danger: '#EF4444',       // Merah untuk stok kritis
    border: '#E2E8F0',
    slate: '#64748B',
    accent: '#D1FAE5'
};

export default function StokBarangHabisScreen() {
    const [baranghabis, setbarangHabis] = useState([]);
    const { user } = useContext(AuthContext);

    async function loadData() {
        try {
            const data = await getBarangHabis();
            // Inisialisasi setiap item dengan properti jumlahPesan = 1
            const initializedData = data.map(item => ({
                ...item,
                jumlahPesan: 1
            }));
            setbarangHabis(initializedData);
        } catch (error) {
            Alert.alert("Kesalahan", "Terjadi kesalahan saat mengambil data");
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    // Fungsi untuk mengubah jumlah pesan (Increment/Decrement)
    const updateJumlahPesan = (id, delta) => {
        setbarangHabis(prev => prev.map(item => {
            if (item.id === id) {
                const newJumlah = Math.max(1, item.jumlahPesan + delta);
                return { ...item, jumlahPesan: newJumlah };
            }
            return item;
        }));
    };

    // Fungsi salin semua (Format Baru)
    const copyAllToClipboard = async () => {
        if (baranghabis.length === 0) return;

        const listNama = baranghabis
            .map(item => `- ${item.nama} (pesan ${item.jumlahPesan}${item.satuan})`)
            .join('\n');

        await Clipboard.setStringAsync(`Daftar Order Barang:\n${listNama}`);
        Alert.alert("Berhasil", "Daftar order telah disalin.");
    };

    // Fungsi salin satu item (Format Baru)
    const copySingleItem = async (item) => {
        const text = `${item.nama} pesan ${item.jumlahPesan}`;
        await Clipboard.setStringAsync(text);
        // Feedback visual singkat bisa ditambahkan di sini
    };

    const renderItem = ({ item }) => (
        <View style={styles.shadowWrapper}>
            <View style={styles.cardItem}>
                <View style={styles.cardLeft}>
                    <Text style={styles.itemName}>{item.nama}</Text>
                    <View style={styles.stockBadge}>
                        <MaterialCommunityIcons name="alert-circle-outline" size={12} color={COLORS.danger} />
                        <Text style={styles.itemStock}>Sisa: {item.stok}</Text>
                    </View>
                </View>

                {/* --- CONTROLLER INCREMENT DECREMENT --- */}
                {user?.level?.toLowerCase() === 'admin' && (
                    <View style={styles.counterContainer}>
                        <TouchableOpacity
                            style={styles.counterBtn}
                            onPress={() => updateJumlahPesan(item.id, -1)}
                            activeOpacity={0.6}
                        >
                            <MaterialCommunityIcons name="minus" size={18} color={COLORS.textDark} />
                        </TouchableOpacity>

                        <View style={styles.jumlahWrapper}>
                            <Text style={styles.jumlahText}>{item.jumlahPesan}</Text>
                        </View>

                        <TouchableOpacity
                            style={styles.counterBtn}
                            onPress={() => updateJumlahPesan(item.id, 1)}
                            activeOpacity={0.6}
                        >
                            <MaterialCommunityIcons name="plus" size={18} color={COLORS.textDark} />
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.contentWrapper}>
                <View style={styles.headerRow}>
                    <View>
                        <Text style={styles.headerTitle}>Perlu Order Lagi!</Text>
                        <Text style={styles.headerSubtitle}>Stok di bawah batas minimum</Text>
                    </View>
                    {user?.level?.toLowerCase() === 'admin' && (
                        <TouchableOpacity
                            style={styles.copyAllBtn}
                            onPress={copyAllToClipboard}
                            activeOpacity={0.8}
                        >
                            <MaterialCommunityIcons name="clipboard-text-multiple" size={20} color="white" />
                            <Text style={styles.copyAllText}>Salin Semua</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <FlatList
                    data={baranghabis}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <View style={styles.emptyIconCircle}>
                                <MaterialCommunityIcons name="check-bold" size={50} color={COLORS.primary} />
                            </View>
                            <Text style={styles.emptyTitle}>Stok Aman!</Text>
                            <Text style={styles.emptyText}>Semua bahan masih tersedia cukup.</Text>
                        </View>
                    }
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.primaryLight
    },
    contentWrapper: {
        flex: 1,
        paddingTop: 20,
        alignSelf: 'center',
        width: '100%',
        maxWidth: isTablet ? 1000 : '100%'
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 25,
        paddingHorizontal: 20
    },
    headerTitle: {
        fontSize: isTablet ? 26 : 22,
        fontWeight: '900',
        color: COLORS.textDark
    },
    headerSubtitle: {
        fontSize: 13,
        color: COLORS.slate,
        marginTop: 2
    },
    copyAllBtn: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 18,
        borderRadius: 15,
        alignItems: 'center',
        gap: 8,
        elevation: 5,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    copyAllText: { color: 'white', fontWeight: 'bold', fontSize: 13 },
    listContainer: {
        paddingHorizontal: 10,
        paddingBottom: 40
    },
    columnWrapper: {
        justifyContent: 'space-between',
        paddingHorizontal: 10
    },
    shadowWrapper: {
        marginVertical: 8,
        marginHorizontal: 16,
        borderRadius: 20,
        backgroundColor: 'white',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
    },
    cardItem: {
        flexDirection: 'row',
        backgroundColor: 'white',
        padding: 18,
        borderRadius: 20,
        alignItems: 'center',
    },
    cardLeft: { flex: 1 },
    itemName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.textDark
    },
    stockBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
        gap: 4
    },
    itemStock: {
        fontSize: 13,
        color: COLORS.danger,
        fontWeight: '700'
    },
    counterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primaryLight,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.accent,
        overflow: 'hidden'
    },
    counterBtn: {
        padding: 10,
        backgroundColor: COLORS.accent
    },
    jumlahWrapper: {
        minWidth: 40,
        alignItems: 'center',
    },
    jumlahText: {
        fontSize: 16,
        fontWeight: '900',
        color: COLORS.textDark,
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 100,
        paddingHorizontal: 40
    },
    emptyIconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        elevation: 5,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.textDark
    },
    emptyText: {
        color: COLORS.slate,
        fontSize: 14,
        textAlign: 'center',
        marginTop: 8
    },
});