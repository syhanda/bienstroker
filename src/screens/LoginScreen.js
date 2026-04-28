import React, { useState, useContext } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    StyleSheet, 
    Dimensions,
    ScrollView,
    Alert,
    KeyboardAvoidingView,
    TouchableWithoutFeedback,
    Keyboard,
    Platform,
    Modal,
    Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../AuthContext';
import { getUserByUsername } from '../database/pengguna';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getDb } from '../database/db';

// Deteksi Layar Tablet
const { width } = Dimensions.get('window');
const isTablet = width > 600;

const COLORS = {
    primary: '#10B981',      // Emerald Green
    primaryLight: '#F0FDFA', // Mint Background
    textDark: '#064E3B',     // Hijau Gelap
    white: '#FFFFFF',
    border: '#E2E8F0',
    slate: '#64748B',
    accent: '#D1FAE5'
};

export default function LoginScreen() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useContext(AuthContext);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [forgotUser, setForgotUser] = useState('');
    const [newPassword, setNewPassword] = useState('');

    async function handleLogin() {
        if (!username || !password) {
            Alert.alert("Input Kosong", "Silakan masukkan username dan password.");
            return;
        }
       
        const user = await getUserByUsername(username);
        
        if (password == user.password) {
            const loginData = { username: user.username, level: user.level }
            login(loginData);
        } else {
            Alert.alert("Login Gagal", "Username atau password salah");
            return;
        }
    };

    const handleUpdatePassword = async () => {
        if (!forgotUser || !newPassword) {
            Alert.alert("Gagal", "Semua kolom harus diisi.");
            return;
        }

        try {
            const db = await getDb();
            // Cek dulu apakah usernya ada
            const user = await getUserByUsername(forgotUser);
            
            if (user) {
                db.runSync('UPDATE pengguna SET password = ? WHERE username = ?', [newPassword, forgotUser]);
                Alert.alert("Berhasil", "Password berhasil diperbarui!");
                setIsModalVisible(false);
                setForgotUser('');
                setNewPassword('');
            } else {
                Alert.alert("Gagal", "Username tidak ditemukan di database.");
            }
        } catch (error) {
            console.log(error);
            Alert.alert("Error", "Gagal memperbarui database.");
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Modal
                animationType="fade"
                transparent={true}
                visible={isModalVisible}
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Reset Password</Text>
                            <TouchableOpacity onPress={() => { setIsModalVisible(false); setForgotUser(''); setNewPassword(''); }}>
                                <MaterialCommunityIcons name="close" size={24} color="gray" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.modalLabel}>Masukkan Username Anda</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Username"
                            placeholderTextColor={COLORS.slate}
                            value={forgotUser}
                            onChangeText={setForgotUser}
                        />

                        <Text style={styles.modalLabel}>Password Baru</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Password Baru"
                            placeholderTextColor={COLORS.slate}
                            secureTextEntry
                            value={newPassword}
                            onChangeText={setNewPassword}
                        />

                        <TouchableOpacity 
                            style={styles.btnUpdate} 
                            onPress={handleUpdatePassword}
                        >
                            <Text style={styles.btnUpdateText}>Perbarui Password</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.loginCard}>
                        
                        {/* --- LOGO / ICON SECTION --- */}
                        <View style={styles.headerSection}>
                            <View style={styles.logoCircle}>
                                <Image source={require('../../assets/logo_bien.jpeg')} style={styles.logo} />
                            </View>
                            <Text style={styles.welcomeText}>Selamat Datang</Text>
                        </View>

                        {/* --- FORM SECTION --- */}
                        <View style={styles.formSection}>
                            <Text style={styles.inputLabel}>Username</Text>
                            <View style={styles.inputWrapper}>
                                <MaterialCommunityIcons name="account-outline" size={20} color={COLORS.slate} style={styles.inputIcon} />
                                <TextInput 
                                    style={styles.input}
                                    placeholder="Masukkan username"
                                    placeholderTextColor={COLORS.slate}
                                    value={username}
                                    onChangeText={setUsername}
                                />
                            </View>

                            <Text style={styles.inputLabel}>Password</Text>
                            <View style={styles.inputWrapper}>
                                <MaterialCommunityIcons name="lock-outline" size={20} color={COLORS.slate} style={styles.inputIcon} />
                                <TextInput 
                                    style={styles.input}
                                    placeholder="Masukkan password"
                                    placeholderTextColor={COLORS.slate}
                                    secureTextEntry={true}
                                    value={password}
                                    onChangeText={setPassword}
                                />
                            </View>

                            <TouchableOpacity style={styles.forgotBtn} onPress={() => {setIsModalVisible(true)}}>
                                <Text style={styles.forgotText}>Lupa Password?</Text>
                            </TouchableOpacity>

                            {/* --- LOGIN BUTTON --- */}
                            <TouchableOpacity 
                                style={styles.loginBtn}
                                onPress={handleLogin}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.loginBtnText}>MASUK</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.primaryLight,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loginCard: {
        width: '100%',
        maxWidth: isTablet ? 500 : '100%',
        backgroundColor: COLORS.white,
        borderRadius: 35,
        padding: isTablet ? 50 : 30,
        // Shadow Premium
        elevation: 15,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 15 },
        shadowOpacity: 0.15,
        shadowRadius: 25,
    },
    headerSection: {
        alignItems: 'center',
        marginBottom: 35,
    },
    logoCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        // Memberikan shadow agar logo terlihat "timbul"
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        marginBottom: 15,
        overflow: 'hidden'
    },
    logo: {
        width: '100%',
        height: '100%'
    },
    welcomeText: {
        fontSize: isTablet ? 28 : 24,
        fontWeight: '900',
        color: COLORS.textDark,
        textAlign: 'center',
    },
    subText: {
        fontSize: 14,
        color: COLORS.slate,
        textAlign: 'center',
        marginTop: 5,
    },
    formSection: {
        width: '100%',
    },
    inputLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.textDark,
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginLeft: 5,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderWidth: 1.5,
        borderColor: COLORS.border,
        borderRadius: 18,
        paddingHorizontal: 15,
        height: 58,
        marginBottom: 20,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: COLORS.textDark,
        fontWeight: '500',
    },
    forgotBtn: {
        alignSelf: 'flex-end',
        marginBottom: 25,
    },
    forgotText: {
        color: COLORS.primary,
        fontWeight: 'bold',
        fontSize: 13,
    },
    loginBtn: {
        backgroundColor: COLORS.primary,
        height: 60,
        borderRadius: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        elevation: 8,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
    },
    loginBtnText: {
        color: 'white',
        fontWeight: '900',
        fontSize: 16,
        letterSpacing: 1,
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)', // Efek gelap di belakang modal
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '90%',
        maxWidth: 450, // Agar tidak terlalu lebar di tablet
        backgroundColor: 'white',
        borderRadius: 25,
        padding: 25,
        elevation: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    modalLabel: {
        fontSize: 14,
        color: COLORS.textDark,
        marginBottom: 8,
        marginTop: 10,
    },
    modalInput: {
        backgroundColor: '#F5F5F5',
        color: COLORS.textDark,
        height: 55,
        borderRadius: 12,
        paddingHorizontal: 15,
        fontSize: 16,
        marginBottom: 10,
    },
    btnUpdate: {
        backgroundColor: 'black',
        height: 55,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        backgroundColor: COLORS.primary
    },
    btnUpdateText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

//     return (
//         <SafeAreaView style={styles.container}>
//             <Modal
//                 animationType="fade"
//                 transparent={true}
//                 visible={isModalVisible}
//                 onRequestClose={() => setIsModalVisible(false)}
//             >
//                 <View style={styles.modalOverlay}>
//                     <View style={styles.modalContent}>
//                         <View style={styles.modalHeader}>
//                             <Text style={styles.modalTitle}>Reset Password</Text>
//                             <TouchableOpacity onPress={() => { setIsModalVisible(false); setForgotUser(''); setNewPassword(''); }}>
//                                 <MaterialCommunityIcons name="close" size={24} color="gray" />
//                             </TouchableOpacity>
//                         </View>

//                         <Text style={styles.modalLabel}>Masukkan Username Anda</Text>
//                         <TextInput
//                             style={styles.modalInput}
//                             placeholder="Username"
//                             placeholderTextColor="#999"
//                             value={forgotUser}
//                             onChangeText={setForgotUser}
//                         />

//                         <Text style={styles.modalLabel}>Password Baru</Text>
//                         <TextInput
//                             style={styles.modalInput}
//                             placeholder="Password Baru"
//                             placeholderTextColor="#999"
//                             secureTextEntry
//                             value={newPassword}
//                             onChangeText={setNewPassword}
//                         />

//                         <TouchableOpacity 
//                             style={styles.btnUpdate} 
//                             onPress={handleUpdatePassword}
//                         >
//                             <Text style={styles.btnUpdateText}>Perbarui Password</Text>
//                         </TouchableOpacity>
//                     </View>
//                 </View>
//             </Modal>

//             <KeyboardAvoidingView 
//                 // Gunakan offset tambahan untuk mendorong konten lebih tinggi
//                 keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
//                 behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//                 style={{ flex: 1 }}
//             >
//                 <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
//                     <ScrollView 
//                         contentContainerStyle={styles.scrollContent}
//                         showsVerticalScrollIndicator={false}
//                         keyboardShouldPersistTaps="handled"
//                     >
//                         <View style={styles.innerContainer}>
//                             {/* --- 1. LOGO & BRANDING --- */}
//                             <View style={styles.brandingContainer}>
//                                 <View style={styles.logoCircle}>
//                                     <Image source={require('../../assets/logo_bien.jpeg')} style={styles.logo} />
//                                 </View>
//                                 {/* <Text style={styles.brandText}>BienStroker</Text> */}
//                                 <Text style={styles.titleText}>Login</Text>
//                             </View>

//                             {/* --- 2. INPUT FORM --- */}
//                             <View style={styles.formContainer}>
//                                 <TextInput 
//                                     style={styles.inputField}
//                                     placeholder="Username"
//                                     placeholderTextColor="#999"
//                                     value={username}
//                                     onChangeText={setUsername}
//                                     autoCapitalize="none"
//                                     // Mencegah keyboard fullscreen di tablet Android
//                                     disableFullscreenUI={true} 
//                                 />
                                
//                                 <TextInput 
//                                     style={styles.inputField}
//                                     placeholder="Password"
//                                     placeholderTextColor="#999"
//                                     value={password}
//                                     onChangeText={setPassword}
//                                     secureTextEntry={true}
//                                     disableFullscreenUI={true}
//                                 />

//                                 <TouchableOpacity style={styles.forgotBtn} onPress={() => {setIsModalVisible(true)}}>
//                                     <Text style={styles.forgotText}>Forgot Password?</Text>
//                                 </TouchableOpacity>
//                             </View>

//                             {/* --- 3. TOMBOL LOG IN --- */}
//                             <TouchableOpacity 
//                                 style={styles.btnLogin} 
//                                 onPress={handleLogin}
//                                 activeOpacity={0.8}
//                             >
//                                 <Text style={styles.btnText}>Log In</Text>
//                             </TouchableOpacity>
//                         </View>
//                     </ScrollView>
//                 </TouchableWithoutFeedback>
//             </KeyboardAvoidingView>
//         </SafeAreaView>
//     );
// }

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: '#F3F6FA', 
//     },
//     scrollContent: {
//         flexGrow: 1,
//         justifyContent: 'center',
//         paddingBottom: 40,
//         paddingHorizontal: 20,
//         alignSelf: 'center',
//         width: '100%',
//         maxWidth: 500,
//     },
//     innerContainer: {
//         paddingHorizontal: 30,
//         alignItems: 'center',
//     },
//     // --- 1. LOGO & BRANDING ---
//     brandingContainer: {
//         alignItems: 'center',
//         marginBottom: 40,
//     },
//     logoCircle: {
//         width: 100,
//         height: 100,
//         borderRadius: 50,
//         backgroundColor: '#FFFFFF',
//         justifyContent: 'center',
//         alignItems: 'center',
//         // Memberikan shadow agar logo terlihat "timbul"
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 4 },
//         shadowOpacity: 0.1,
//         shadowRadius: 10,
//         elevation: 5,
//         marginBottom: 15,
//         overflow: 'hidden'
//     },
//     logo: {
//         width: '100%',
//         height: '100%'
//     },
//     logoText: {
//         fontSize: 18,
//         fontWeight: 'bold',
//         color: '#3A4B56',
//     },
//     brandText: {
//         fontSize: 26,
//         fontWeight: 'bold',
//         color: '#2C3E50', // Biru charcoal dashboard
//         letterSpacing: 1,
//     },
//     titleText: {
//         fontSize: 18,
//         color: '#95A5A6',
//         marginTop: 5,
//     },
//     // --- 2. INPUT FORM ---
//     formContainer: {
//         width: '100%',
//         marginBottom: 20,
//     },
//     inputField: {
//         backgroundColor: '#FFFFFF',
//         paddingVertical: 15,
//         paddingHorizontal: 20,
//         borderRadius: 15,
//         fontSize: 16,
//         color: '#2C3E50',
//         marginBottom: 15,
//         // Shadow halus seperti pada menu dashboard
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.05,
//         shadowRadius: 5,
//         elevation: 2,
//     },
//     forgotBtn: {
//         alignSelf: 'flex-end',
//         marginTop: 5,
//     },
//     forgotText: {
//         color: '#5D6D7E',
//         fontSize: 14,
//         fontWeight: '500',
//     },
//     // --- 3. TOMBOL LOG IN ---
//     btnLogin: {
//         width: '100%',
//         backgroundColor: '#1961a9', // Mengambil warna teks utama dashboard untuk tombol
//         paddingVertical: 16,
//         borderRadius: 15,
//         alignItems: 'center',
//         marginTop: 20,
//         // Shadow untuk tombol utama
//         shadowColor: '#2C3E50',
//         shadowOffset: { width: 0, height: 4 },
//         shadowOpacity: 0.3,
//         shadowRadius: 6,
//         elevation: 8,
//     },
//     btnText: {
//         color: '#FFFFFF',
//         fontSize: 18,
//         fontWeight: 'bold',
//     },

//     modalOverlay: {
//         flex: 1,
//         backgroundColor: 'rgba(0,0,0,0.5)', // Efek gelap di belakang modal
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     modalContent: {
//         width: '90%',
//         maxWidth: 450, // Agar tidak terlalu lebar di tablet
//         backgroundColor: 'white',
//         borderRadius: 25,
//         padding: 25,
//         elevation: 10,
//     },
//     modalHeader: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         marginBottom: 20,
//     },
//     modalTitle: {
//         fontSize: 20,
//         fontWeight: 'bold',
//     },
//     modalLabel: {
//         fontSize: 14,
//         color: '#666',
//         marginBottom: 8,
//         marginTop: 10,
//     },
//     modalInput: {
//         backgroundColor: '#F5F5F5',
//         color: '#2C3E50',
//         height: 55,
//         borderRadius: 12,
//         paddingHorizontal: 15,
//         fontSize: 16,
//         marginBottom: 10,
//     },
//     btnUpdate: {
//         backgroundColor: 'black',
//         height: 55,
//         borderRadius: 12,
//         justifyContent: 'center',
//         alignItems: 'center',
//         marginTop: 20,
//         backgroundColor: '#1961a9'
//     },
//     btnUpdateText: {
//         color: 'white',
//         fontSize: 16,
//         fontWeight: 'bold',
//     },
// });