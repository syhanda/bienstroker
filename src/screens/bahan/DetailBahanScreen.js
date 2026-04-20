import React, { useState, useCallback, useContext } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { getBahan } from '../../database/bahan';
import * as FileSystem from 'expo-file-system/legacy';
import { AuthContext } from '../../AuthContext';

export default function DetailBahanScreen({ route, navigation }) {
    const { itemId } = route.params || null;
    const [bahan, setBahan] = useState(null);
    const { user } = useContext(AuthContext);

    useFocusEffect(
        useCallback(() => {
            async function loadData() {
                try {
                    const data = await getBahan(itemId)
                    const uriFinal = `${FileSystem.documentDirectory}${data.gambar}`;
                    data.gambar = uriFinal;
                    setBahan(data);
                } catch (error) {
                    console.error("Gagal memuat detail:", error);
                    Alert.alert("Error", "Gagal memuat data bahan.");
                }
            }
            loadData();
        }, [itemId])
    );

    if (!bahan) {
        return (
            <View style={styles.center}>
                <Text>Memuat data...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* --- GAMBAR BAHAN --- */}
                <View style={styles.imageWrapper}>
                    <Image 
                        source={{ uri: bahan.gambar }} 
                        style={styles.imageBahan} 
                        resizeMode="cover"
                    />
                </View>

                {/* --- KARTU INFORMASI --- */}
                <View style={styles.infoCard}>
                    <View style={styles.row}>
                        <View>
                            <Text style={styles.label}>Nama Bahan</Text>
                            <Text style={styles.valueName}>{bahan.nama}</Text>
                        </View>
                        {/* Status Alert jika stok di bawah minimum */}
                        {bahan.stok <= bahan.min_stok && (
                            <View style={styles.badgeWarning}>
                                <Text style={styles.warningText}>Restock!</Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.row}>
                        <View>
                            <Text style={styles.label}>Stok Saat Ini</Text>
                            <Text style={[styles.value, { color: bahan.stok <= bahan.min_stok ? 'red' : 'green' }]}>
                                {bahan.stok} {bahan.satuan}
                            </Text>
                        </View>
                        <View>
                            <Text style={[styles.label, { textAlign: 'right' }]}>Minimum Stok</Text>
                            <Text style={[styles.value, { textAlign: 'right' }]}>{bahan.min_stok} {bahan.satuan}</Text>
                        </View>
                    </View>
                </View>

                {(user.level == 'admin') ? (
                    <TouchableOpacity 
                        style={styles.btnEdit}
                        onPress={() => navigation.navigate('bahanForm', { itemId: bahan.id })}
                        activeOpacity={0.8}
                    >
                        <MaterialCommunityIcons name="pencil" size={20} color="white" />
                        <Text style={styles.btnEditText}>Edit Data Bahan</Text>
                    </TouchableOpacity>
                ) : (
                    <View></View>
                )}

            </ScrollView>
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    scrollContent: {
        paddingBottom: 40,
        alignSelf: 'center',
        width: '100%',
        maxWidth: 600, // Menjaga konten tidak terlalu lebar di tablet
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    imageWrapper: {
        marginHorizontal: 20,
        borderRadius: 20,
        backgroundColor: 'white',
        // Shadow agar gambar terlihat "mengambang"
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
    },
    imageBahan: {
        width: '100%',
        height: 300,
        borderRadius: 20,
    },
    infoCard: {
        backgroundColor: 'white',
        margin: 20,
        padding: 25,
        borderRadius: 25,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    label: {
        fontSize: 12,
        color: '#888',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    valueName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 5,
    },
    value: {
        fontSize: 18,
        fontWeight: '700',
        marginTop: 5,
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginVertical: 20,
    },
    badgeWarning: {
        backgroundColor: '#FFEBEE',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
    },
    warningText: {
        color: '#D32F2F',
        fontSize: 12,
        fontWeight: 'bold',
    },
    btnEdit: {
        backgroundColor: 'black',
        flexDirection: 'row',
        marginHorizontal: 20,
        height: 60,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        elevation: 5,
    },
    btnEditText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});