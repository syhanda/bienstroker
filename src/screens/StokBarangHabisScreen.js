import React, { useEffect, useState } from 'react';
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

const { width } = Dimensions.get('window');
const isTablet = width > 600;

export default function StokBarangHabisScreen() {
    const [baranghabis, setbarangHabis] = useState([]);

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
                    <Text style={styles.itemStock}>Sisa Stok: {item.stok}</Text>
                </View>

                {/* --- CONTROLLER INCREMENT DECREMENT --- */}
                <View style={styles.counterContainer}>
                    <TouchableOpacity 
                        style={styles.counterBtn} 
                        onPress={() => updateJumlahPesan(item.id, -1)}
                    >
                        <MaterialCommunityIcons name="minus" size={20} color="black" />
                    </TouchableOpacity>
                    
                    <Text style={styles.jumlahText}>{item.jumlahPesan}</Text>
                    
                    <TouchableOpacity 
                        style={styles.counterBtn} 
                        onPress={() => updateJumlahPesan(item.id, 1)}
                    >
                        <MaterialCommunityIcons name="plus" size={20} color="black" />
                    </TouchableOpacity>
                </View>

                {/* <TouchableOpacity 
                    style={styles.actionBtn} 
                    onPress={() => copySingleItem(item)}
                >
                    <MaterialCommunityIcons name="content-copy" size={24} color="black" />
                </TouchableOpacity> */}
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.contentWrapper}>
                <View style={styles.headerRow}>
                    <Text style={styles.headerTitle}>Perlu Order Lagi!</Text>
                    <TouchableOpacity 
                        style={styles.copyAllBtn} 
                        onPress={copyAllToClipboard}
                        activeOpacity={0.7}
                    >
                        <MaterialCommunityIcons name="clipboard-text-multiple" size={20} color="white" />
                        <Text style={styles.copyAllText}>Salin Semua</Text>
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={baranghabis}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <MaterialCommunityIcons name="check-circle-outline" size={60} color="#DDD" />
                            <Text style={styles.emptyText}>Semua stok masih aman!</Text>
                        </View>
                    }
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F2F5F8' },
    contentWrapper: { flex: 1, padding: 20, alignSelf: 'center', width: '100%', maxWidth: 800 },
    headerRow: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 20 
    },
    headerTitle: { fontSize: 22, fontWeight: 'bold' },
    copyAllBtn: { 
        backgroundColor: 'black', 
        flexDirection: 'row', 
        padding: 10, 
        borderRadius: 10, 
        alignItems: 'center',
        gap: 8
    },
    copyAllText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
    cardItem: {
        flexDirection: 'row',
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 15,
        alignItems: 'center',
        overflow: 'hidden',
    },
    cardLeft: { flex: 1 },
    itemName: { fontSize: 16, fontWeight: 'bold' },
    itemStock: { fontSize: 13, color: 'red', marginTop: 2 },
    
    // Counter Styles
    counterContainer: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: '#EEE', 
        borderRadius: 10,
        marginHorizontal: 15
    },
    counterBtn: { padding: 8 },
    jumlahText: { 
        fontSize: 16, 
        fontWeight: 'bold', 
        minWidth: 30, 
        textAlign: 'center' 
    },
    actionBtn: { padding: 5 },
    shadowWrapper: {
        // 1. Berikan ruang agar bayangan tidak terpotong container induk
        margin: 10, 
        borderRadius: 20,
        backgroundColor: 'white', // Wajib di Android agar elevation muncul

        // 2. Setting Bayangan (iOS)
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 10,

        // 3. Setting Bayangan (Android)
        elevation: 10,

        // PENTING: Jangan gunakan overflow: 'hidden' di sini!
    },
}); 
//     container: {
//         flex: 1,
//         backgroundColor: 'white',
//     },
//     contentWrapper: {
//         flex: 1,
//         paddingHorizontal: 20,
//         paddingTop: 30,
//         alignSelf: 'center',
//         width: '100%',
//         maxWidth: 700, // Menjaga layout tetap rapi di tablet
//     },
//     headerRow: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         marginBottom: 25,
//     },
//     headerTitle: {
//         fontSize: isTablet ? 24 : 20,
//         fontWeight: 'bold',
//         color: '#000',
//     },
//     copyAllBtn: {
//         backgroundColor: 'black',
//         padding: 10,
//         borderRadius: 10,
//         elevation: 3,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.2,
//         shadowRadius: 3,
//     },
//     listContainer: {
//         paddingBottom: 20,
//     },
//     cardItem: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         borderWidth: 1,
//         borderColor: '#000',
//         borderRadius: 18,
//         paddingVertical: 18,
//         paddingHorizontal: 20,
//         marginBottom: 15,
//         backgroundColor: 'white',
//     },
//     cardLeft: {
//         flex: 1,
//     },
//     itemName: {
//         fontSize: isTablet ? 18 : 16,
//         fontWeight: 'bold',
//         color: '#000',
//         marginBottom: 4,
//     },
//     itemStock: {
//         fontSize: 14,
//         color: '#666',
//     },
//     emptyState: {
//         alignItems: 'center',
//         marginTop: 100,
//     },
//     emptyText: {
//         marginTop: 15,
//         color: '#999',
//         fontSize: 16,
//     }
// });