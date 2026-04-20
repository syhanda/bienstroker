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
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getBarangHabis, getStats } from '../database/bahan';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../AuthContext';
import * as TaskManager from 'expo-task-manager';
import { sendLowStockNotification } from '../components/StockNotification';

const { width } = Dimensions.get('window');
const isTablet = width > 600;

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
            <View style={styles.header}>
                <Text style={styles.brandName}>BienStroker</Text>
                <TouchableOpacity onPress={() => setMenuVisible(true)}>
                    <Ionicons name="person-circle-outline" size={38} color="black" />
                </TouchableOpacity>
            </View>

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
                            style={styles.userMenuItem}
                            onPress={() => {
                                setMenuVisible(false);
                                handleLogout();
                            }}
                        >
                            <MaterialCommunityIcons name="logout" size={20} color="#C62828" />
                            <Text style={[styles.menuItemText, { color: '#C62828' }]}>Logout</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.dateLabel}>
                    Ringkasan {new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' })}
                </Text>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsScroll} contentContainerStyle={{ flexGrow: 1, justifyContent: 'space-evenly' }}>
                    <View style={[styles.shadowWrapper, { backgroundColor: '#E0F2F1' }]}>
                        <View style={[styles.card, { backgroundColor: '#E0F2F1' }]}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.cardValue}>+{ringkasan.pemasukan}</Text>
                                <MaterialCommunityIcons name="truck-delivery-outline" size={57} color="#00695C" />
                            </View>
                            <Text style={styles.cardTitle}>Jumlah Total Masuk</Text>
                            <TouchableOpacity style={[styles.detailBtn, { marginTop: 'auto' }]} onPress={() => navigation.navigate('pemasukan')}>
                                <Text style={styles.detailText}>Cek Detail Segera</Text>
                                <Ionicons name="caret-down" size={12} color="black" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={[styles.shadowWrapper, { backgroundColor: '#E3F2FD' }]}>
                        <View style={[styles.card, { backgroundColor: '#E3F2FD' }]}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.cardValue}>-{ringkasan.pemakaian}</Text>
                                <MaterialCommunityIcons name="trending-down" size={57} color="#1565C0" />
                            </View>
                            <Text style={styles.cardTitle}>Jumlah Total Pakai</Text>
                            <TouchableOpacity style={[styles.detailBtn, { marginTop: 'auto' }]} onPress={() => navigation.navigate('pemakaian')}>
                                <Text style={styles.detailText}>Cek Detail Segera</Text>
                                <Ionicons name="caret-down" size={12} color="black" />
                            </TouchableOpacity>
                        </View>
                    </View> 

                    <View style={[styles.shadowWrapper, { backgroundColor: '#FFF3E0' }]}>
                        <View style={[styles.card, { backgroundColor: '#FFF3E0' }]}>
                            <View style={styles.cardHeader}>
                                <Text style={[{ fontSize: 40, width: '60%', fontWeight: 'bold'}]}>Stok Barang Habis</Text>
                                <MaterialCommunityIcons name="package-variant-remove" size={57} color="#E65100" />
                            </View>
                            <TouchableOpacity style={[styles.detailBtn, { marginTop: 'auto' }]} onPress={() => { navigation.navigate('stokBarangHabis') }}>
                                <Text style={styles.detailText}>Cek Detail Segera</Text>
                                <Ionicons name="caret-down" size={12} color="black" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>

                <View style={styles.menuList}>
                    <MenuButton 
                        icon="cube-outline" 
                        title="Stok Barang" 
                        onPress={() => navigation.navigate('bahan')} 
                    />
                    <MenuButton 
                        icon="archive-arrow-down-outline" 
                        title="Kelola Stok Masuk" 
                        onPress={() => navigation.navigate('pemasukan')} 
                    />
                    <MenuButton 
                        icon="trending-down" 
                        title="Pemakaian Harian" 
                        onPress={() => navigation.navigate('pemakaian')} 
                    />
                    <MenuButton 
                        icon="file-document-edit-outline" 
                        title="Laporan" 
                        onPress={() => navigation.navigate('laporan')} 
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const MenuButton = ({ icon, title, onPress }) => (
    <TouchableOpacity style={styles.menuItemWrapper} onPress={onPress}>
        <LinearGradient
            style={styles.menuItem}
            colors={['#FFFFFF', '#E8F0F8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
        >
            <View style={styles.menuLeft}>
                <MaterialCommunityIcons name={icon} size={35} color="#3A4B56" />
                <Text style={styles.menuLabel}>{title}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#3A4B56" />
        </LinearGradient>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F5F8',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    brandName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#34495E',
    },
    scrollContent: {
        paddingHorizontal: 15,
    },
    dateLabel: {
        fontSize: 14,
        color: '#95A5A6',
        marginBottom: 15,
        marginLeft: 5,
    },
    statsScroll: {
        marginBottom: 25,
    },
    shadowWrapper: {
        margin: 10, 
        borderRadius: 20,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 7,
    },
    card: {
        width: isTablet ? 250 : 180, 
        height: isTablet ? 200 : 160,
        borderRadius: 20,
        padding: 19,
        marginRight: 12,
        overflow: 'hidden'
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    cardValue: {
        marginTop: 20,
        fontSize: 55,
        fontWeight: 'bold',
        color: '#1A535C',
    },
    cardTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: '#2C3E50',
        lineHeight: 20,
    },
    detailBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 'auto',
    },
    detailText: {
        fontSize: 11,
        color: '#5D6D7E',
        marginRight: 4,
    },
    menuList: {
        marginTop: 10,
    },
    menuItemWrapper: {
        marginBottom: 12,
        paddingHorizontal: 5,
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 19,
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    menuLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuLabel: {
        fontSize: 18,
        fontWeight: '500',
        marginLeft: 15,
        color: '#2C3E50',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.02)',
    },
    dropdownMenu: {
        position: 'absolute',
        top: 60,
        right: 20,
        width: isTablet ? 250 : 200,
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 15,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    userSection: {
        marginBottom: 8,
    },
    menuUsername: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    menuRole: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginVertical: 10,
    },
});