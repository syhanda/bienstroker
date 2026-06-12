import React, { useState, useCallback, useContext } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Alert, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { getBahan } from '../../database/bahan';
import * as FileSystem from 'expo-file-system/legacy';
import { AuthContext } from '../../AuthContext';

const { width } = Dimensions.get('window');
const isTablet = width > 600;

const COLORS = {
    primary: '#10B981',      // Emerald Green
    primaryLight: '#F0FDFA', // Background Teal Muda
    textDark: '#064E3B',     // Hijau Gelap
    white: '#FFFFFF',
    danger: '#EF4444',       // Merah stok kritis
    border: '#E2E8F0',
};

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
                <View style={styles.responsiveLayout}>

                    {/* --- BAGIAN GAMBAR --- */}
                    <View style={styles.imageSection}>
                        <View style={styles.imageWrapper}>
                            <Image
                                source={{ uri: bahan.gambar }}
                                style={styles.imageBahan}
                                resizeMode="cover"
                            />
                        </View>
                    </View>

                    {/* --- BAGIAN INFO & ACTION --- */}
                    <View style={styles.infoSection}>
                        <View style={styles.infoCard}>
                            <View style={styles.headerRow}>
                                <View>
                                    <Text style={styles.label}>Nama Barang</Text>
                                    <Text style={styles.valueName}>{bahan.nama}</Text>
                                </View>
                                {bahan.stok <= bahan.min_stok && (
                                    <View style={styles.badgeWarning}>
                                        <MaterialCommunityIcons name="alert-decagram" size={16} color={COLORS.danger} />
                                        <Text style={styles.warningText}>RESTOCK</Text>
                                    </View>
                                )}
                            </View>

                            <View style={styles.divider} />

                            <View style={styles.statsGrid}>
                                <View style={styles.statBox}>
                                    <Text style={styles.label}>Stok Saat Ini</Text>
                                    <Text style={[styles.value, { color: bahan.stok <= bahan.min_stok ? COLORS.danger : COLORS.primary }]}>
                                        {bahan.stok} <Text style={styles.unitText}>{bahan.satuan}</Text>
                                    </Text>
                                </View>
                                <View style={styles.statBox}>
                                    <Text style={[styles.label, { textAlign: isTablet ? 'left' : 'right' }]}>Minimum Stok</Text>
                                    <Text style={[styles.value, { textAlign: isTablet ? 'left' : 'right' }]}>
                                        {bahan.min_stok} <Text style={styles.unitText}>{bahan.satuan}</Text>
                                    </Text>
                                </View>
                            </View>

                            {/* Tombol Edit di dalam kartu jika tablet, agar tidak melayang jauh */}
                            {user.level === 'admin' && (
                                <TouchableOpacity
                                    style={styles.btnEdit}
                                    onPress={() => navigation.navigate('bahanForm', { itemId: bahan.id })}
                                >
                                    <MaterialCommunityIcons name="pencil" size={20} color="white" />
                                    <Text style={styles.btnEditText}>Edit Data Barang</Text>
                                </TouchableOpacity>
                            )}
                        </View>
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
        paddingBottom: 40,
        paddingTop: isTablet ? 40 : 0,
    },
    responsiveLayout: {
        flexDirection: isTablet ? 'row' : 'column',
        alignSelf: 'center',
        width: '100%',
        maxWidth: isTablet ? 1100 : 500,
        paddingHorizontal: isTablet ? 40 : 0,
        gap: isTablet ? 30 : 0,
    },
    imageSection: {
        flex: isTablet ? 1 : 0,
    },
    imageWrapper: {
        marginHorizontal: isTablet ? 0 : 20,
        marginTop: isTablet ? 0 : 20,
        borderRadius: 30,
        backgroundColor: 'white',
        elevation: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 15,
        overflow: 'hidden',
    },
    imageBahan: {
        width: '100%',
        height: isTablet ? 450 : 320,
    },
    floatingBadge: {
        position: 'absolute',
        top: 20,
        left: 20,
        backgroundColor: COLORS.danger,
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 12,
    },
    floatingBadgeText: {
        color: 'white',
        fontWeight: '900',
        fontSize: 12,
    },
    infoSection: {
        flex: isTablet ? 1.2 : 0,
    },
    infoCard: {
        backgroundColor: 'white',
        margin: 20,
        padding: 30,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: COLORS.border,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.05,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    label: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1.2,
    },
    valueName: {
        fontSize: 28,
        fontWeight: '800',
        color: COLORS.textDark,
        marginTop: 8,
    },
    divider: {
        height: 1.5,
        backgroundColor: COLORS.primaryLight,
        marginVertical: 25,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    statBox: {
        flex: 1,
    },
    value: {
        fontSize: 24,
        fontWeight: '800',
        marginTop: 8,
        color: COLORS.textDark,
    },
    unitText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#94A3B8',
    },
    badgeWarning: {
        backgroundColor: '#FEF2F2',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#FEE2E2',
        gap: 5,
    },
    warningText: {
        color: COLORS.danger,
        fontSize: 11,
        fontWeight: '900',
    },
    btnEdit: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        height: 60,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        marginTop: 30,
        elevation: 6,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    btnEditText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
});
