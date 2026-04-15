import React, { useContext } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity,
    Dimensions,
    Alert 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../AuthContext';

const { width } = Dimensions.get('window');
const isTablet = width > 600;

export default function ProfileScreen({ navigation }) {
    const { user, logout } = useContext(AuthContext);

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
            <View style={styles.contentWrapper}>
                
                {/* --- 1. AVATAR / ICON PROFILE --- */}
                {/* <View style={styles.profileHeader}>
                    <View style={styles.avatarCircle}>
                        <MaterialCommunityIcons name="account" size={isTablet ? 80 : 60} color="black" />
                    </View>
                </View> */}

                {/* --- 2. USER INFO CARD --- */}
                <View style={styles.infoCard}>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Username</Text>
                        <Text style={styles.value}>{user?.username}</Text>
                    </View>
                    
                    <View style={styles.divider} />
                    
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Level</Text>
                        <View style={styles.roleBadge}>
                            <Text style={styles.roleText}>{user?.level}</Text>
                        </View>
                    </View>
                </View>

                {/* --- 3. LOGOUT BUTTON --- */}
                <TouchableOpacity 
                    style={styles.btnLogout} 
                    onPress={handleLogout}
                    activeOpacity={0.8}
                >
                    <MaterialCommunityIcons name="logout" size={20} color="white" />
                    <Text style={styles.btnText}>Logout</Text>
                </TouchableOpacity>

                <Text style={styles.versionText}>BienStroker v1.0.0</Text>
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
        paddingHorizontal: 25,
        alignSelf: 'center',
        width: '100%',
        maxWidth: 500, // Menjaga elemen tetap di tengah pada tablet
    },
    // profileHeader: {
    //     alignItems: 'center',
    //     marginBottom: 40,
    // },
    avatarCircle: {
        width: isTablet ? 140 : 110,
        height: isTablet ? 140 : 110,
        borderRadius: isTablet ? 70 : 55,
        borderWidth: 1,
        borderColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9F9F9',
    },
    infoCard: {
        borderWidth: 1,
        borderColor: '#000',
        borderRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: 20,
        marginBottom: 40,
        backgroundColor: 'white',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 18,
    },
    label: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    value: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    roleBadge: {
        backgroundColor: '#000',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 8,
    },
    roleText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    divider: {
        height: 1,
        backgroundColor: '#EEE',
    },
    btnLogout: {
        backgroundColor: '#000',
        flexDirection: 'row',
        height: 55,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
    },
    btnText: {
        color: 'white',
        fontSize: 15,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    versionText: {
        textAlign: 'center',
        marginTop: 20,
        color: '#BBB',
        fontSize: 12,
    }
});