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

    const [stokHabis, setStokHabis] = useState([
        { id: '1', nama: 'Gula', sisa: 0 },
        { id: '2', nama: 'Susu Kaleng', sisa: 2 },
        { id: '3', nama: 'Tepung Terigu', sisa: 0 },
    ]);

    async function loadData() {
        try {
            const data = await getBarangHabis();
            setbarangHabis(data);
        } catch (error) {
            Alert.alert("Kesalahan", "Terjadi kesalahan saat mengambil data");
            return;
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    // Fungsi untuk menyalin semua nama bahan ke clipboard
    const copyAllToClipboard = async () => {
        const listNama = baranghabis?.map(item => `- ${item.nama} (Sisa: ${item.stok})`).join('\n');
        await Clipboard.setStringAsync(`Daftar Order Barang:\n${listNama}`);
        Alert.alert("Berhasil", "Daftar barang telah disalin ke clipboard.");
    };

    // Fungsi untuk menyalin satu item saja
    const copySingleItem = async (nama) => {
        await Clipboard.setStringAsync(nama);
        // Feedback kecil tanpa alert agar tidak mengganggu flow
    };

    const renderItem = ({ item }) => (
        <View style={styles.cardItem}>
            <View style={styles.cardLeft}>
                <Text style={styles.itemName}>{item.nama}</Text>
                <Text style={styles.itemStock}>Sisa Stok: {item.stok}</Text>
            </View>
            <TouchableOpacity onPress={() => copySingleItem(item.nama)}>
                <MaterialCommunityIcons 
                    name="alert-outline" 
                    size={28} 
                    color="black" 
                />
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.contentWrapper}>
                
                {/* --- HEADER DENGAN TOMBOL COPY ALL --- */}
                <View style={styles.headerRow}>
                    <Text style={styles.headerTitle}>Perlu Order Lagi!</Text>
                    <TouchableOpacity 
                        style={styles.copyAllBtn} 
                        onPress={copyAllToClipboard}
                        activeOpacity={0.7}
                    >
                        <MaterialCommunityIcons name="content-copy" size={20} color="white" />
                    </TouchableOpacity>
                </View>

                {/* --- LIST BARANG --- */}
                <FlatList
                    data={baranghabis}
                    keyExtractor={(item) => item.id}
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
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    contentWrapper: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 30,
        alignSelf: 'center',
        width: '100%',
        maxWidth: 700, // Menjaga layout tetap rapi di tablet
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 25,
    },
    headerTitle: {
        fontSize: isTablet ? 24 : 20,
        fontWeight: 'bold',
        color: '#000',
    },
    copyAllBtn: {
        backgroundColor: 'black',
        padding: 10,
        borderRadius: 10,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    listContainer: {
        paddingBottom: 20,
    },
    cardItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#000',
        borderRadius: 18,
        paddingVertical: 18,
        paddingHorizontal: 20,
        marginBottom: 15,
        backgroundColor: 'white',
    },
    cardLeft: {
        flex: 1,
    },
    itemName: {
        fontSize: isTablet ? 18 : 16,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 4,
    },
    itemStock: {
        fontSize: 14,
        color: '#666',
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        marginTop: 15,
        color: '#999',
        fontSize: 16,
    }
});