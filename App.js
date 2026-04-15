import { useState, useEffect, useContext } from 'react';
import { View, ActivityIndicator, Linking, Alert, TouchableOpacity } from 'react-native';
import HomeScreen from './src/screens/HomeScreen';
import PemakaianBarangScreen from './src/screens/pemakaian/PemakaianBarangScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import PemakaianBarangForm from './src/screens/pemakaian/PemakaianBarangForm';
import { getDb, initDb } from './src/database/db';
import BahanScreen from './src/screens/bahan/BahanScreen';
import BahanFormScreen from './src/screens/bahan/BahanFormScreen';
import LaporanScreen from './src/screens/laporan/LaporanScreen';
import DetailBahanScreen from './src/screens/bahan/DetailBahanScreen';
import PemasukanBarangDetail from './src/screens/pemasukan/PemasukanBarangDetail';
import PemakaianBarangDetail from './src/screens/pemakaian/PemakaianBarangDetail';
import { registerForPushNotificationsAsync } from './src/components/StockNotification';
import PemasukanBarangScreen from './src/screens/pemasukan/PemasukanBarangScreen';
import PemasukanBarangForm from './src/screens/pemasukan/PemasukanBarangForm';
import LoginScreen from './src/screens/LoginScreen';
import ProfileScreen from './src/screens/pengguna/ProfileScreen';
import StokBarangHabisScreen from './src/screens/StokBarangHabisScreen';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { seed } from './src/database/pengguna';
import { AuthProvider } from './src/AuthContext';
import { AuthContext } from './src/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';

const Stack = createNativeStackNavigator();

function RootStack() {
    const { user, isLoading } = useContext(AuthContext);
    const navigation = useNavigation();

    // 1. Tampilkan Loading saat aplikasi sedang mengecek Async Storage
    if (isLoading) {
        return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#2196F3" />
        </View>
        );
    }

    return (
        <Stack.Navigator>
            {user == null ? (
                <Stack.Group>
                    <Stack.Screen name='login' component={LoginScreen} options={{ title: "" }} />
                </Stack.Group>    
            ) : (
                <Stack.Group>
                    <Stack.Screen
                        name='home'
                        component={HomeScreen}
                        options={{
                            headerShown: false,
                        }} />
                    <Stack.Screen name='bahanForm' component={BahanFormScreen} options={{ title: "Tambah Barang Baru" }} />
                    <Stack.Screen name='bahanDetail' component={DetailBahanScreen} options={{ title: "Detail Barang" }} />
                    <Stack.Screen name='pemakaian' component={PemakaianBarangScreen} options={{ title: "Pemakaian Harian" }} />
                    <Stack.Screen name='pemakaianForm' component={PemakaianBarangForm} options={{ title: "Tambah Pemakaian Harian" }} />
                    <Stack.Screen name='pemakaianDetail' component={PemakaianBarangDetail} options={{ title: "" }} />
                    <Stack.Screen name='pemasukan' component={PemasukanBarangScreen} options={{ title: "kelola Stok Masuk" }} />
                    <Stack.Screen name='pemasukanForm' component={PemasukanBarangForm} options={{ title: "" }} />
                    <Stack.Screen name='pemasukanDetail' component={PemasukanBarangDetail} options={{ title: "Detail Stok Masuk" }} />
                    <Stack.Screen name='bahan' component={BahanScreen} options={{ title: "Stok Barang" }} />
                    <Stack.Screen name='stokBarangHabis' component={StokBarangHabisScreen} options={{ title: "Stok Barang Habis" }} />
                    <Stack.Screen name='laporan' component={LaporanScreen} options={{ title: "Tambah Pemakaian Harian" }} />
                    <Stack.Screen name='profile' component={ProfileScreen} options={{ title: "Profile" }} />
                </Stack.Group>
            )}
        </Stack.Navigator>
    );
}

export default function App() {
    const [dbReady, setDbReady] = useState(false);

    useEffect(() => {
      // Tangkap JS error yang tidak tertangkap
      const errorHandler = (error, isFatal) => {
          console.error(`[GlobalError] Fatal: ${isFatal}`, error);
          // Kalau mau kirim ke server bisa tambahkan di sini
      };
      
      ErrorUtils.setGlobalHandler(errorHandler);

        async function prep() {
            try {
                await requestPermission();
                await registerForPushNotificationsAsync();
                await initDb();
                // await seed();
                // Uncomment untuk reset DB saat development:
                // const db = await getDb();
                // db.execSync('DROP TABLE IF EXISTS pengguna; DROP TABLE IF EXISTS pemakaian_item; DROP TABLE IF EXISTS pemakaian; DROP TABLE IF EXISTS bahan; DROP TABLE IF EXISTS pemasukan; DROP TABLE IF EXISTS pemasukan_item;');

                setDbReady(true);
            } catch (error) {
                console.error('Gagal inisialisasi app:', error);
            }
        }

        async function requestPermission() {
            // 1. Minta Izin Kamera
            const statusKamera = await ImagePicker.requestCameraPermissionsAsync();
            
            // 2. Minta Izin Galeri (Media Library)
            const statusGaleri = await MediaLibrary.getPermissionsAsync();

            // Jika salah satu ditolak permanen
            if (statusKamera.status !== 'granted' || statusGaleri.status !== 'none') {
                Alert.alert(
                    "Izin Diperlukan",
                    "Aplikasi ini membutuhkan akses Kamera dan Galeri untuk mengelola foto bahan baku. Silakan aktifkan di Pengaturan.",
                    [
                        { text: "Nanti Saja", style: "cancel" },
                        { text: "Buka Pengaturan", onPress: () => Linking.openSettings() }
                    ]
                );
            }
        }

        prep();
    }, []);

    if (!dbReady) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <AuthProvider>
            <NavigationContainer>
                <RootStack />
            </NavigationContainer>
        </AuthProvider>
    );
}