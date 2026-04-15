import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useState, useCallback, useContext } from 'react';
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

const { width } = Dimensions.get('window');
const isTablet = width > 600;

export default function HomeScreen() {
    const [ringkasan, setRingkasan] = useState({
        pemasukan: 0,
        pemakaian: 0,
        stokHabis: 0,
    });
    const navigation = useNavigation();
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
                {/* Overlay transparan untuk menutup menu jika klik di luar */}
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

                {/* Stats Cards Row */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsScroll} contentContainerStyle={{ flexGrow: 1, justifyContent: 'space-evenly' }}>              
                    


                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardValue}>+{ringkasan.pemasukan}</Text>
                            <MaterialCommunityIcons name="truck-delivery-outline" size={32} color="black" />
                        </View>
                        <Text style={styles.cardTitle}>Jumlah Total Masuk</Text>
                        <TouchableOpacity style={[styles.detailBtn, { marginTop: 'auto' }]} onPress={() => navigation.navigate('pemasukan')}>
                            <Text style={styles.detailText}>Cek Detail Segera</Text>
                            <Ionicons name="caret-down" size={12} color="black" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardValue}>-{ringkasan.pemakaian}</Text>
                            <MaterialCommunityIcons name="trending-down" size={32} color="black" />
                        </View>
                        <Text style={styles.cardTitle}>Jumlah Total Pakai</Text>
                        <TouchableOpacity style={[styles.detailBtn, { marginTop: 'auto' }]} onPress={() => navigation.navigate('pemakaian')}>
                            <Text style={styles.detailText}>Cek Detail Segera</Text>
                            <Ionicons name="caret-down" size={12} color="black" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardValue}>{ringkasan.stokHabis}</Text>
                            {/* <Text style={[styles.cardTitle, { fontSize: 22, width: '60%', marginTop: 0 }]}>Stok Barang Habis</Text> */}
                            <MaterialCommunityIcons name="package-variant-remove" size={32} color="black" />
                        </View>
                        <Text style={styles.cardTitle}>Stok Barang Habis</Text>
                        <TouchableOpacity style={[styles.detailBtn, { marginTop: 'auto' }]} onPress={() => { navigation.navigate('stokBarangHabis') }}>
                            <Text style={styles.detailText}>Cek Detail Segera</Text>
                            <Ionicons name="caret-down" size={12} color="black" />
                        </TouchableOpacity>
                    </View>
                </ScrollView>

                {/* Main Menu List */}
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

// Sub-komponen agar kode lebih bersih
const MenuButton = ({ icon, title, onPress }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
        <View style={styles.menuLeft}>
            <MaterialCommunityIcons name={icon} size={26} color="black" />
            <Text style={styles.menuLabel}>{title}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="black" />
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        marginBottom: 10,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    brandName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'black',
    },
    scrollContent: {
        paddingBottom: 30,
        // paddingHorizontal: isTablet ? width * 0.1 : 0,
    },
    brandText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'black',
    },
    divider: {
        height: 1,
        backgroundColor: '#E0E0E0',
        marginVertical: 12,
    },
    dateLabel: {
        paddingHorizontal: 20,
        marginBottom: 10,
        fontSize: 14,
        color: '#B0B0B0',
        fontWeight: '600',
    },
    statsScroll: {
        paddingLeft: 20,
        marginBottom: 25,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.02)', // Overlay sangat tipis
    },
    dropdownMenu: {
        position: 'absolute',
        top: 60, // Muncul tepat di bawah header
        right: 20,
        width: isTablet ? 250 : 200,
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 15,
        // Shadow untuk efek melayang (floating)
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
    // divider: {
    //     height: 1,
    //     backgroundColor: '#F0F0F0',
    //     marginVertical: 10,
    // },
    userMenuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        gap: 12,
    },
    menuItemText: {
        fontSize: 14,
        fontWeight: '500',
    },
    card: {
        width: isTablet ? 250 : 180, 
        height: isTablet ? 200 : 160,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 15,
        marginRight: 15,
        borderWidth: 1,
        borderColor: '#000',
        // Shadow untuk iOS
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        // Elevation untuk Android
        elevation: 10,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    cardValue: {
        fontSize: isTablet ? 42 : 32,
        fontWeight: 'bold',
    },
    cardTitle: {
        fontSize: isTablet ? 18 : 14,
        fontWeight: 'bold',
        marginTop: 5,
        color: '#333',
    },
    detailBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    detailText: {
        fontSize: 11,
        fontStyle: 'italic',
        marginRight: 4,
    },
    menuList: {
        paddingHorizontal: 20,
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: isTablet ? 25 : 18,
        borderRadius: 15,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        elevation: 2,
    },
    menuLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuLabel: {
        fontSize: isTablet ? 20 : 16,
        fontWeight: '600',
        marginLeft: 15,
    },
});

// export default function HomeScreen() {
//     const [ringkasan, setRingkasan] = useState({
//         pemasukan: 0,
//         pemakaian: 0,
//     });
//     const navigation = useNavigation();

//     useFocusEffect(
//         useCallback(() => {
//             let isActive = true;

//             async function loadData() {
//                 try {                                   
//                     const result = await getStats();

//                     if (isActive && result) {          
//                         setRingkasan({
//                             pemasukan: result.pemasukan?.total_pemasukan ?? 0,  
//                             pemakaian: result.pemakaian?.total_pemakaian ?? 0,
//                         });
//                     }
//                 } catch (err) {
//                     console.error("Gagal load stats:", err);
//                 }
//             }

//             loadData();

//             return () => { isActive = false; };       
//         }, [])
//     );

//     return (
//         <SafeAreaView edges={['left', 'right']} style={styles.container}>
//             <ScrollView contentContainerStyle={styles.scrollContent}>
//                 <View style={styles.header}>
//                     <Text style={styles.welcomeText}>Manajemen Bahan</Text>
//                     <Text style={styles.dateText}>Ringkasan {new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' }) ?? "Kosong"}</Text>
//                 </View>

//                 <View style={styles.statsRow}>
//                     <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
//                         <Text style={styles.statLabel}>Total Masuk</Text>
//                         <Text style={[styles.statValue, { color: '#2E7D32' }]}>+{ringkasan.pemasukan}</Text>
//                     </View>

//                     <View style={[styles.statCard, { backgroundColor: '#FFEBEE' }]}>
//                         <Text style={styles.statLabel}>Total Pakai</Text>
//                         <Text style={[styles.statValue, { color: '#C62828' }]}>-{ringkasan.pemakaian}</Text>
//                     </View>
//                 </View>

//                 <Text style={styles.sectionTitle}>Menu Utama</Text>

//                 <TouchableOpacity 
//                     style={styles.menuButton} 
//                     onPress={() => navigation.navigate('bahan')}
//                 >
//                     <View style={[styles.iconCircle, { backgroundColor: '#2196F3' }]}>
//                         <Text style={styles.iconEmoji}>📦</Text>
//                     </View>
//                     <View style={styles.menuTextContent}>
//                         <Text style={styles.menuTitle}>Stok Barang</Text>
//                     </View>
//                     <Text style={styles.arrow}>❯</Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity 
//                     style={styles.menuButton} 
//                     onPress={() => navigation.navigate('pemasukan')}
//                 >
//                     <View style={[styles.iconCircle, { backgroundColor: '#4CAF50' }]}>
//                         <Text style={styles.iconEmoji}>📥</Text>
//                     </View>
//                     <View style={styles.menuTextContent}>
//                         <Text style={styles.menuTitle}>Pemasukan Barang</Text>
//                     </View>
//                     <Text style={styles.arrow}>❯</Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity 
//                     style={styles.menuButton} 
//                     onPress={() => navigation.navigate('pemakaian')}
//                 >
//                     <View style={[styles.iconCircle, { backgroundColor: '#FF9800' }]}>
//                         <Text style={styles.iconEmoji}>📉</Text>
//                     </View>
//                     <View style={styles.menuTextContent}>
//                         <Text style={styles.menuTitle}>Pemakaian Barang Harian</Text>
//                     </View>
//                     <Text style={styles.arrow}>❯</Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity 
//                     style={styles.menuButton} 
//                     onPress={() => navigation.navigate('laporan')}
//                 >
//                     <View style={[styles.iconCircle, { backgroundColor: '#FF9800' }]}>
//                         <Text style={styles.iconEmoji}>📉</Text>
//                     </View>
//                     <View style={styles.menuTextContent}>
//                         <Text style={styles.menuTitle}>Laporan</Text>
//                     </View>
//                     <Text style={styles.arrow}>❯</Text>
//                 </TouchableOpacity>
//             </ScrollView>
//         </SafeAreaView>
//     )
// }

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: '#F5F7FA'
//     },

//     scrollContent: {
//         padding: 20
//     },

//     header: {
//         marginBottom: 25
//     },

//     welcomeText: {
//         fontSize: 24,
//         fontWeight: 'bold',
//         color: '#333'
//     },

//     dateText: {
//         fontSize: 14,
//         color: '#777',
//         marginTop: 4
//     },

//     statsRow: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         marginBottom: 30
//     },
//     statCard: {
//         flex: 1,
//         padding: 15,
//         borderRadius: 12,
//         marginHorizontal: 5,
//         elevation: 2
//     },
//     statLabel: {
//         fontSize: 12,
//         color: '#555',
//         fontWeight: '600'
//     },
//     statValue: {
//         fontSize: 20,
//         fontWeight: 'bold',
//         marginTop: 5
//     },

//     sectionTitle: {
//         fontSize: 18,
//         fontWeight: 'bold',
//         color: '#333',
//         marginBottom: 15
//     },

//     menuButton: {
//         backgroundColor: '#FFF',
//         flexDirection: 'row',
//         alignItems: 'center',
//         padding: 15,
//         borderRadius: 15,
//         marginBottom: 12,
//         elevation: 3,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.1,
//         shadowRadius: 4,
//     },

//     iconCircle: {
//         width: 50,
//         height: 50,
//         borderRadius: 25,
//         justifyContent: 'center',
//         alignItems: 'center'
//     },

//     iconEmoji: {
//         fontSize: 20
//     },

//     menuTextContent: {
//         flex: 1,
//         marginLeft: 15
//     },

//     menuTitle: {
//         fontSize: 16,
//         fontWeight: 'bold',
//         color: '#333'
//     },

//     menuSub: {
//         fontSize: 12,
//         color: '#888',
//         marginTop: 2
//     },

//     arrow: {
//         fontSize: 18,
//         color: '#CCC'
//     },
// })