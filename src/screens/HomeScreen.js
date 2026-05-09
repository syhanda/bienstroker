import { useFocusEffect } from '@react-navigation/native';
import { useState, useCallback, useContext, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    Modal,
    Alert,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getBarangHabis, getStats } from '../database/bahan';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../AuthContext';

const { width } = Dimensions.get('window');
const isTablet = width > 600;

const COLORS = {
    primary: '#10B981',     // Emerald Green
    secondary: '#059669',   // Darker Emerald
    accent: '#34D399',      // Light Emerald
    background: '#F0FDFA',  // Teal sangat muda untuk bg
    white: '#FFFFFF',
    textDark: '#064E3B',    // Hijau sangat gelap untuk teks
};

export default function HomeScreen({ navigation }) {
    const [ringkasan, setRingkasan] = useState({
        pemasukan: 0,
        pemakaian: 0,
        stokHabis: 0,
    });
    const { user, logout } = useContext(AuthContext);
    const [menuVisible, setMenuVisible] = useState(false);

    useFocusEffect(
        useCallback(() => {
            let isActive = true;
            async function loadData() {
                try {
                    const result = await getStats();
                    const barangHabis = await getBarangHabis()
                    if (isActive && result && barangHabis) {
                        setRingkasan({
                            pemasukan: result.pemasukan?.total_pemasukan ?? 0,
                            pemakaian: result.pemakaian?.total_pemakaian ?? 0,
                            stokHabis: barangHabis.length ?? 0,
                        });
                    }
                } catch (err) {
                    console.error("Gagal load stats:", err);
                }
            }
            loadData();
            return () => { isActive = false; };
        }, [])
    );

    const handleLogout = () => {
        Alert.alert(
            "Logout",
            "Apakah Anda yakin ingin keluar?",
            [
                { text: "Batal", style: "cancel" },
                {
                    text: "Keluar",
                    style: "destructive",
                    onPress: () => {
                        logout();
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* HEADER */}
            <View style={styles.header}>
                <Text style={styles.brandName}>BienStroker</Text>
                <TouchableOpacity onPress={() => setMenuVisible(true)}>
                    <Ionicons name="person-circle-outline" size={38} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            {/* MODAL MENU */}
            <Modal
                visible={menuVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setMenuVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setMenuVisible(false)}
                >
                    <View style={styles.dropdownMenu}>
                        <View style={styles.userSection}>
                            <Text style={styles.menuUsername}>{user.username}</Text>
                            <Text style={styles.menuRole}>{user.level}</Text>
                        </View>
                        <View style={styles.divider} />
                        <TouchableOpacity
                            onPress={() => { setMenuVisible(false); handleLogout(); }}
                        >
                            <MaterialCommunityIcons name="logout" size={20} color="#C62828" />
                            <Text style={{ color: '#C62828' }}>Logout</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.dateLabel}>
                    Ringkasan {new Date().toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </Text>

                {/* STATS CARDS */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsScroll} contentContainerStyle={{ flexGrow: 1, justifyContent: 'space-evenly' }}>
                    {/* Card Masuk - Minty Green */}
                    <LinearGradient
                        colors={['#34D399', '#10B981']}
                        style={styles.card}
                    >
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardValue}>+{ringkasan.pemasukan}</Text>
                            <MaterialCommunityIcons name="truck-delivery-outline" size={57} color="rgba(255,255,255,0.8)" />
                        </View>
                        <Text style={styles.cardTitle}>Total Masuk Barang</Text>
                        <TouchableOpacity style={styles.detailBtn} onPress={() => navigation.navigate('pemasukan')}>
                            <Text style={styles.detailText}>Cek Detail</Text>
                            <Ionicons name="chevron-forward" size={12} color="white" />
                        </TouchableOpacity>
                    </LinearGradient>

                    {/* Card Pakai - Deep Teal */}
                    <LinearGradient
                        colors={['#14B8A6', '#0D9488']}
                        style={styles.card}
                    >
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardValue}>-{ringkasan.pemakaian}</Text>
                            <MaterialCommunityIcons name="trending-down" size={57} color="rgba(255,255,255,0.8)" />
                        </View>
                        <Text style={styles.cardTitle}>Total Pakai Barang</Text>
                        <TouchableOpacity style={styles.detailBtn} onPress={() => navigation.navigate('pemakaian')}>
                            <Text style={styles.detailText}>Cek Detail</Text>
                            <Ionicons name="chevron-forward" size={12} color="white" />
                        </TouchableOpacity>
                    </LinearGradient>

                    {/* Card Stok Habis - Warning Lime/Forest */}
                    <LinearGradient
                        colors={['#84CC16', '#65A30D']}
                        style={styles.card}
                    >
                        <View style={styles.cardHeader}>
                            <Text style={[styles.cardTitle, { fontSize: 34, width: '60%' }]}>Total Barang Habis</Text>
                            <MaterialCommunityIcons name="package-variant-remove" size={57} color="rgba(255,255,255,0.8)" />
                        </View>
                        <TouchableOpacity style={styles.detailBtn} onPress={() => { navigation.navigate('stokBarangHabis') }}>
                            <Text style={styles.detailText}>Cek Detail</Text>
                            <Ionicons name="chevron-forward" size={12} color="white" />
                        </TouchableOpacity>
                    </LinearGradient>
                </ScrollView>

                {/* MAIN MENU BUTTONS */}
                <View style={styles.menuList}>
                    {user?.level?.toLowerCase() !== 'owner' && (
                        <>
                            <MenuButton icon="cube-outline" title="Stok Barang" onPress={() => navigation.navigate('bahan')} />
                            <MenuButton icon="archive-arrow-down-outline" title="Kelola Stok Masuk" onPress={() => navigation.navigate('pemasukan')} />
                            <MenuButton icon="trending-down" title="Pemakaian Harian" onPress={() => navigation.navigate('pemakaian')} />
                        </>
                    )}
                    <MenuButton icon="file-document-edit-outline" title="Laporan" onPress={() => navigation.navigate('laporan')} />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const MenuButton = ({ icon, title, onPress }) => (
    <TouchableOpacity style={styles.menuItemWrapper} onPress={onPress}>
        <View style={styles.menuItem}>
            <View style={styles.menuLeft}>
                <View style={styles.iconCircle}>
                    <MaterialCommunityIcons name={icon} size={26} color={COLORS.primary} />
                </View>
                <Text style={styles.menuLabel}>{title}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
        </View>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 20,
        backgroundColor: COLORS.white,
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    brandName: {
        fontSize: 26,
        fontWeight: 'bold',
        color: COLORS.textDark,
        letterSpacing: -0.5,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 20,
    },
    dateLabel: {
        fontSize: 11,
        fontWeight: '800',
        color: '#9f9d9d',
        marginBottom: 15,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    statsScroll: {
        marginBottom: 30,
    },
    card: {
        width: isTablet ? 250 : 180,
        height: isTablet ? 200 : 160,
        borderRadius: 24,
        padding: 20,
        marginRight: 15,
        justifyContent: 'space-between',
        elevation: 6,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    cardValue: {
        fontSize: 45,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.white,
    },
    detailBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.25)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    detailText: {
        fontSize: 10,
        color: COLORS.white,
        marginRight: 4,
        fontWeight: 'bold',
    },
    menuList: {
        marginTop: 5,
    },
    menuItemWrapper: {
        marginBottom: 12,
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: COLORS.white,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    menuLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconCircle: {
        width: 42,
        height: 42,
        backgroundColor: '#F0FDFA',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 15,
        color: COLORS.textDark,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
    },
    dropdownMenu: {
        position: 'absolute',
        top: 70,
        right: 20,
        width: isTablet ? 250 : 200,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 15,
        elevation: 10,
    },
    userSection: {
        marginBottom: 10,
    },
    menuUsername: {
        fontWeight: 'bold',
        fontSize: 16,
        color: COLORS.textDark,
    },
    menuRole: {
        fontSize: 12,
        color: '#64748B',
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginVertical: 10,
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoutText: {
        color: '#EF4444',
        marginLeft: 10,
        fontWeight: 'bold'
    }
});