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
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../AuthContext';
import { getUserByUsername } from '../database/pengguna';
import { useNavigation } from '@react-navigation/native';

// Deteksi Layar Tablet
const { width } = Dimensions.get('window');
const isTablet = width > 600;

export default function LoginScreen() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useContext(AuthContext);
    const navigation = useNavigation();

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

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView 
                // Gunakan offset tambahan untuk mendorong konten lebih tinggi
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    {/* PENTING: Gunakan flexGrow: 1 agar ScrollView bisa memanjang 
                      dan memberikan ruang bagi keyboard untuk mendorong konten.
                    */}
                    <ScrollView 
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View style={styles.innerContainer}>
                            {/* --- 1. LOGO & BRANDING --- */}
                            <View style={styles.brandingContainer}>
                                <View style={styles.logoCircle}>
                                    <Text style={styles.logoText}>LOGO</Text>
                                </View>
                                <Text style={styles.brandText}>BienStroker</Text>
                                <Text style={styles.titleText}>Login</Text>
                            </View>

                            {/* --- 2. INPUT FORM --- */}
                            <View style={styles.formContainer}>
                                <TextInput 
                                    style={styles.inputField}
                                    placeholder="Username"
                                    placeholderTextColor="#999"
                                    value={username}
                                    onChangeText={setUsername}
                                    autoCapitalize="none"
                                    // Mencegah keyboard fullscreen di tablet Android
                                    disableFullscreenUI={true} 
                                />
                                
                                <TextInput 
                                    style={styles.inputField}
                                    placeholder="Password"
                                    placeholderTextColor="#999"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={true}
                                    disableFullscreenUI={true}
                                />

                                <TouchableOpacity style={styles.forgotBtn}>
                                    <Text style={styles.forgotText}>Forgot Password?</Text>
                                </TouchableOpacity>
                            </View>

                            {/* --- 3. TOMBOL LOG IN --- */}
                            <TouchableOpacity 
                                style={styles.btnLogin} 
                                onPress={handleLogin}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.btnText}>Log In</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>




















        // <SafeAreaView style={styles.container}>
        //     <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        // style={{ flex: 1 }}>
        //         <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        //             <ScrollView contentContainerStyle={styles.scrollContent}>
                
        //                 {/* --- 1. LOGO & BRANDING --- */}
        //                 <View style={styles.brandingContainer}>
        //                     <View style={styles.logoCircle}>
        //                         <Text style={styles.logoText}>LOGO</Text>
        //                     </View>
        //                     <Text style={styles.brandText}>BienStroker</Text>
        //                     <Text style={styles.titleText}>Login</Text>
        //                 </View>

        //                 {/* --- 2. INPUT FORM (Minimalis & Bergaris) --- */}
        //                 <View style={styles.formContainer}>
        //                     <TextInput 
        //                         style={styles.inputField}
        //                         placeholder="Username"
        //                         placeholderTextColor="#999"
        //                         value={username}
        //                         onChangeText={setUsername}
        //                         autoCapitalize="none"
        //                     />
                            
        //                     <TextInput 
        //                         style={styles.inputField}
        //                         placeholder="Password"
        //                         placeholderTextColor="#999"
        //                         value={password}
        //                         onChangeText={setPassword}
        //                         secureTextEntry={true} // Sembunyikan password
        //                     />

        //                     {/* Lupa Password */}
        //                     <TouchableOpacity style={styles.forgotBtn}>
        //                         <Text style={styles.forgotText}>Forgot Password?</Text>
        //                     </TouchableOpacity>
        //                 </View>

        //                 {/* --- 3. TOMBOL LOG IN --- */}
        //                 <TouchableOpacity 
        //                     style={styles.btnLogin} 
        //                     onPress={handleLogin}
        //                     activeOpacity={0.8}
        //                 >
        //                     <Text style={styles.btnText}>Log In</Text>
        //                 </TouchableOpacity>

        //             </ScrollView>
        //         </TouchableWithoutFeedback>
        //     </KeyboardAvoidingView>
        // </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingBottom: 40,
        paddingHorizontal: 20,
        alignSelf: 'center',
        width: '100%',
        maxWidth: 500, 
    },
    innerContainer: {
        width: '100%',
        maxWidth: 450,
    },
    
    // --- Branding Style ---
    brandingContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 1,
        borderColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    logoText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#000',
    },
    brandText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 10,
    },
    titleText: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#000',
    },

    // --- Form Style ---
    formContainer: {
        marginBottom: 30,
    },
    inputField: {
        width: '100%',
        height: 55,
        borderWidth: 1,
        borderColor: '#000', // Garis hitam tipis
        borderRadius: 12,
        paddingHorizontal: 20,
        fontSize: 16,
        backgroundColor: 'white',
        marginBottom: 15,
        color: '#000'
    },
    forgotBtn: {
        alignSelf: 'flex-start', // Rata kiri
        marginTop: -5,
        // marginBottom: 20,
    },
    forgotText: {
        fontSize: 12,
        color: '#888',
        fontStyle: 'italic',
    },

    // --- Button Style ---
    btnLogin: {
        backgroundColor: 'black', // Tombol hitam pekat
        width: '100%',
        height: 60,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        // Shadow (Bayangan)
        elevation: 6, // Shadow Android
        shadowColor: '#000', // Shadow iOS
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
    },
    btnText: {
        color: 'white', // Text putih
        fontSize: 16,
        fontWeight: 'bold',
        textTransform: 'uppercase', // Text kapital
    },
});