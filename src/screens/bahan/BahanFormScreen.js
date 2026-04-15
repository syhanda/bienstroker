// import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Alert, Image } from "react-native";
// import { useCallback, useState, useEffect } from "react";
// import { insertBahan } from "../../database/bahan";
// import { useFocusEffect, useNavigation } from "@react-navigation/native";
// import { getBahan } from "../../database/bahan";
// import { useSubmitGuard } from "../../hooks/submitGuard";
// import * as ImagePicker from "expo-image-picker";
// import * as FileSystem from "expo-file-system/legacy";

// export default function BahanFormScreen({ route }) {
//     const [namaBahan, setNamaBahan] = useState('');
//     const [satuan, setSatuan] = useState('');
//     const [minStok, setMinStok] = useState('');
//     const [isInvalid, setIsInvalid] = useState(false);
//     const navigation = useNavigation();
//     const { isSubmitting, withGuard } = useSubmitGuard();
//     const [gambarUri, setGambarUri] = useState('');
//     const { itemId } = route.params ?? {};
//     const [isSaved, setIsSaved] = useState(false);

//     useFocusEffect(
//         useCallback(() => {
//             let isActive = true;

//             if (itemId) {
//                 async function loadData() {
//                     try {
//                         const result = await getBahan(itemId);

//                         if (isActive && result) {
//                             setNamaBahan(result.nama);
//                             setSatuan(result.satuan)
//                             setMinStok(result.min_stok.toString());
//                         }
//                     } catch (err) {
//                         console.error("Gagal load bahan:", err);
//                     }
//                 }

//                 loadData();
//             }

//             return () => {
//                 isActive = false;
//             }
//         }, [itemId])
//     );

//     useEffect(() => {
//         return () => {
//             cleanupGambar();
//         };
//     }, [gambarUri, isSaved]);

//     async function cleanupGambar() {
//         if (gambarUri && !isSaved) {
//             // Bangun URI absolut karena yang tersimpan di state adalah path relatif
//             const pathAbsolut = `${FileSystem.documentDirectory}${gambarUri}`;
                    
//             try {
//                 const info = await FileSystem.getInfoAsync(pathAbsolut);
//                 if (info.exists) {
//                     await FileSystem.deleteAsync(pathAbsolut, { idempotent: true });
//                     console.log("Cleanup: Gambar sementara (tidak disimpan) telah dihapus.");
//                 }
//             } catch (error) {
//                 console.error("Gagal melakukan cleanup gambar:", error);
//             }
//         }
//     }

//     async function ambilGambar() {
//         const hasil = await ImagePicker.launchCameraAsync({
//             // allowsEditing: true,
//             // aspect: [1, 1],
//             // quality: 0.5,
//         });

//         if (!hasil.canceled && hasil.assets[0]) {
//             const tempUri = hasil.assets[0].uri;
//             const fileName = `bahan_${Date.now()}.jpg`;
//             const subFolder = 'gambar_bahan';
            
//             // Buat path tujuan lengkap untuk proses pemindahan fisik
//             const folderUri = `${FileSystem.documentDirectory}${subFolder}/`;
//             const fileUriTujuan = `${folderUri}${fileName}`;

//             try {
//                 // Pastikan folder ada
//                 const folderInfo = await FileSystem.getInfoAsync(folderUri);
//                 if (!folderInfo.exists) {
//                     await FileSystem.makeDirectoryAsync(folderUri, { intermediates: true });
//                 }

//                 // Pindahkan file menggunakan API klasik (Anti-Error "Not Absolute")
//                 await FileSystem.moveAsync({
//                     from: tempUri,
//                     to: fileUriTujuan
//                 });

//                 // SIMPAN HANYA PATH RELATIF KE DB
//                 const relativePath = `${subFolder}/${fileName}`;
//                 setGambarUri(relativePath); 
                
//                 console.log("✅ Berhasil simpan path relatif:", relativePath);
//             } catch (error) {
//                 console.error("Gagal total di Form:", error);
//             }
//         }
//     }

//     async function handleSimpan() {
//         if (!namaBahan || !minStok) {
//             setIsInvalid(true)
//             return;
//         }

//         try {                         
//             const result = await insertBahan(namaBahan, deskripsiBahan, minStok, gambarUri);

//             if (result.changes > 0) {
//                 setIsSaved(true);
//                 Alert.alert(
//                     itemId ? "Berhasil Diubah" : "Berhasil Disimpan",
//                     `Bahan "${namaBahan}" telah dicatat.`,
//                     [{ text: "OK", onPress: () => navigation.goBack() }]
//                 );
//             }
//         } catch (error) {
//             console.error(error);
//             Alert.alert("Gagal", "Terjadi kesalahan saat menyimpan.");
//         }
//     }

//     const handleBatal = () => {
//         cleanupGambar();
//         navigation.goBack();
//     };

//     return (
//         <KeyboardAvoidingView
//             behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//             style={styles.container}
//         >
//             <ScrollView contentContainerStyle={styles.scrollContent}>
//                 <Text style={styles.title}>
//                     {itemId ? 'Edit Bahan' : 'Tambah Bahan Baru'}
//                 </Text>

//                 <View style={styles.card}>
//                     <View style={styles.inputGroup}>
//                         <Text style={styles.label}>Nama bahan</Text>
//                         <TextInput
//                             style={[
//                                 styles.input,
//                                 isInvalid && styles.inputInvalid
//                             ]}
//                             value={namaBahan}
//                             onChangeText={(val) => {
//                                 setNamaBahan(val);
//                                 setIsInvalid(false);
//                             }}
//                         />
//                     </View>

//                     <View style={styles.inputGroup}>
//                         <Text style={styles.label}>Satuan bahan</Text>
//                         <TextInput
//                             style={[
//                                 styles.input,
//                                 isInvalid && styles.inputInvalid
//                             ]}
//                             value={satuan}
//                             onChangeText={(value) => {
//                                 setSatuan(value);
//                                 setIsInvalid(false);
//                             }}
//                         />
//                     </View>

//                     <View style={styles.inputGroup}>
//                         <Text style={styles.label}>Minimum stok</Text>
//                         <TextInput
//                             style={[
//                                 styles.input,
//                                 isInvalid && styles.inputInvalid
//                             ]}
//                             value={minStok}
//                             onChangeText={(value) => {
//                                 const cleaned = value.replace(/[^0-9]/g, '');
//                                 setMinStok(cleaned);
//                                 setIsInvalid(false);
//                             }}
//                             keyboardType="numeric"
//                         />
//                         <Text style={styles.helperText}>
//                             Sistem akan memberi notifikasi jika stok sama atau di bawah angka ini.
//                         </Text>
//                     </View>

//                     <TouchableOpacity style={styles.imagePicker} onPress={ambilGambar}>
//                         {gambarUri ? (
//                             <View style={styles.previewContainer}>
//                                 <Image 
//                                     source={{ uri: gambarUri }} 
//                                     style={styles.previewImage} 
//                                     onResizeMode="cover" // Memastikan gambar memenuhi kotak
//                                 />
//                                 <View style={styles.changeBadge}>
//                                     <Text style={styles.changeText}>Ganti Foto</Text>
//                                 </View>
//                             </View>
//                         ) : (
//                             <View style={styles.placeholder}>
//                                 <Text style={styles.placeholderText}>Ketuk untuk ambil foto</Text>
//                             </View>
//                         )}
//                     </TouchableOpacity>

//                     <TouchableOpacity style={styles.btnSimpan} disabled={isSubmitting} onPress={() => withGuard(handleSimpan) }>
//                         <Text style={styles.btnSimpanText}>{isSubmitting ? 'Menyimpan...' : 'Simpan Bahan'}</Text>
//                     </TouchableOpacity>

//                     <TouchableOpacity 
//                         style={styles.btnBatal} 
//                         onPress={() => {handleBatal}}
//                     >
//                         <Text style={styles.btnBatalText}>Batal</Text>
//                     </TouchableOpacity>
//                 </View>
//             </ScrollView>
//         </KeyboardAvoidingView>
//     )
// }

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: '#F8F9FA',
//     },

//     scrollContent: {
//         padding: 20,
//     },

//     title: {
//         fontSize: 24,
//         fontWeight: 'bold',
//         marginBottom: 25,
//         marginTop: 10,
//         color: '#1A1A1A',
//     },

//     label: {
//         fontSize: 15,
//         fontWeight: '600',
//         color: '#333',
//         marginBottom: 8,
//     },

//     input: {
//         borderWidth: 1,
//         borderColor: '#E0E0E0',
//         borderRadius: 10,
//         padding: 12,
//         fontSize: 16,
//         backgroundColor: '#FAFAFA',
//         color: '#333',
//     },

//     inputInvalid: {
//         borderColor: '#d94f4f'
//     },

//     card: {
//         backgroundColor: '#FFF',
//         borderRadius: 16,
//         padding: 20,
//         elevation: 4, // Shadow Android
//         shadowColor: '#000', // Shadow iOS
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.1,
//         shadowRadius: 8,
//     },

//     inputGroup: {
//         marginBottom: 20,
//     },

//     helperText: {
//         fontSize: 12,
//         color: '#888',
//         fontStyle: 'italic',
//         marginTop: 6,
//     },

//     btnSimpan: {
//         backgroundColor: '#4CAF50',
//         padding: 16,
//         borderRadius: 12,
//         alignItems: 'center',
//         marginTop: 10,
//     },

//     btnSimpanText: {
//         color: '#FFF',
//         fontSize: 16,
//         fontWeight: 'bold',
//     },

//     btnBatal: {
//         padding: 16,
//         alignItems: 'center',
//         marginTop: 5,
//     },

//     btnBatalText: {
//         color: '#999',
//         fontSize: 14,
//         fontWeight: '500',
//     },

//     imagePicker: {
//         width: '100%',
//         height: 200,
//         borderRadius: 12,
//         backgroundColor: '#f0f0f0',
//         borderWidth: 1,
//         borderColor: '#ddd',
//         borderStyle: 'dashed',
//         justifyContent: 'center',
//         alignItems: 'center',
//         overflow: 'hidden',
//         marginBottom: 20,
//     },

//     placeholder: { alignItems: 'center' },
//     placeholderText: { color: '#999', marginTop: 8 },
//     changeBadge: {
//         position: 'absolute',
//         bottom: 10,
//         right: 10,
//         backgroundColor: 'rgba(0,0,0,0.6)',
//         paddingHorizontal: 10,
//         paddingVertical: 5,
//         borderRadius: 5,
//     },
//     changeText: { color: '#fff', fontSize: 12 },

//     previewContainer: {
//         width: '100%',
//         height: '100%',
//     },
//     previewImage: {
//         width: '100%', 
//         height: '100%', // Pastikan height bukan 0
//         borderRadius: 12,
//     },
// })


import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Dimensions,
  Platform,
  Image,
  Alert,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import DropdownComponent from '../../components/DropdownComponent';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { insertBahan, getBahan} from '../../database/bahan';

const { width } = Dimensions.get('window');
const isTablet = width > 600;

export default function BahanFormScreen({ route }) {
  const [nama, setNama] = useState('');
  const [satuan, setSatuan] = useState('');
  const [minStok, setMinStok] = useState('');
  const [gambarUri, setGambarUri] = useState(null);
  const navigation = useNavigation();
  const { itemId } = route.params ?? {};
  const [isSaved, setIsSaved] = useState(false);

  const dataSatuan = [
    { label: 'Kilogram (kg)', value: 'kg' },
    { label: 'Gram (g)', value: 'g' },
    { label: 'Liter (l)', value: 'l' },
    { label: 'Mililiter (ml)', value: 'ml' },
    { label: 'Pcs / Buah', value: 'pcs' },
    { label: 'Pack / Dus', value: 'pack' },
  ];

 useFocusEffect(
        useCallback(() => {
            let isActive = true;

            if (itemId) {
                async function loadData() {
                    try {
                        const result = await getBahan(itemId);

                        if (isActive && result) {
                            setNama(result.nama);
                            setSatuan(result.satuan)
                            setMinStok(result.min_stok.toString());
                        }
                    } catch (err) {
                        console.error("Gagal load bahan:", err);
                    }
                }

                loadData();
            }

            return () => {
                isActive = false;
            }
        }, [itemId])
    );

    async function cleanupGambar() {
        if (gambarUri && !isSaved) {
            // Bangun URI absolut karena yang tersimpan di state adalah path relatif
            const pathAbsolut = `${FileSystem.documentDirectory}${gambarUri}`;
                    
            try {
                const info = await FileSystem.getInfoAsync(pathAbsolut);
                if (info.exists) {
                    await FileSystem.deleteAsync(pathAbsolut, { idempotent: true });
                    console.log("Cleanup: Gambar sebelumnya telah dihapus.");
                }
            } catch (error) {
                console.error("Gagal melakukan cleanup gambar:", error);
            }
        }
    }

    async function ambilGambar() {
        if (!gambarUri) { cleanupGambar() }
        const hasil = await ImagePicker.launchCameraAsync({
            allowsEditing: false,
            aspect: [1, 1],
        });

        if (!hasil.canceled && hasil.assets[0]) {
            const tempUri = hasil.assets[0].uri;
            const fileName = `bahan_${Date.now()}.jpg`;
            const subFolder = 'gambar_bahan';
            
            // Buat path tujuan lengkap untuk proses pemindahan fisik
            const folderUri = `${FileSystem.documentDirectory}${subFolder}/`;
            const fileUriTujuan = `${folderUri}${fileName}`;

            try {
                // Pastikan folder ada
                const folderInfo = await FileSystem.getInfoAsync(folderUri);
                if (!folderInfo.exists) {
                    await FileSystem.makeDirectoryAsync(folderUri, { intermediates: true });
                }

                // Pindahkan file menggunakan API klasik (Anti-Error "Not Absolute")
                await FileSystem.moveAsync({
                    from: tempUri,
                    to: fileUriTujuan
                });

                // SIMPAN HANYA PATH RELATIF KE DB
                const relativePath = `${subFolder}/${fileName}`;
                setGambarUri(relativePath); 
                
                console.log("Berhasil simpan path relatif:", relativePath);
            } catch (error) {
                console.error("Gagal total di Form:", error);
            }
        }
    }

    async function handleSimpan() {
        if (!nama || !minStok) {
            setIsInvalid(true)
            return;
        }
        
        try {                         
            const result = await insertBahan(nama, satuan, minStok, gambarUri);

            if (result.changes > 0) {
                setIsSaved(true);
                Alert.alert(
                    itemId ? "Berhasil Diubah" : "Berhasil Disimpan",
                    `Bahan "${nama}" telah dicatat.`,
                    [{ text: "OK", onPress: () => navigation.goBack() }]
                );
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Gagal", "Terjadi kesalahan saat menyimpan.");
        }
    }

    const handleBatal = () => {
        cleanupGambar();
        navigation.goBack();
    };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.formContainer}>
            
            {/* Input Nama Barang */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nama Barang</Text>
              <TextInput 
                style={styles.input}
                placeholder='Contoh: Gula Pasir'
                placeholderTextColor="#999"
                value={nama}
                onChangeText={setNama}
              />
            </View>

            {/* Dropdown Satuan (Simulasi) */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Satuan</Text>
              <DropdownComponent 
                    data={dataSatuan}
                    placeholder={"--Satuan--"}
                    value={satuan}
                    onChange={(val) => setSatuan(val)}
                />
            </View>

            {/* Batas Minimum Stok */}
            <View style={styles.inputGroup}>
              <Text style={styles.labelMinStok}>Batas Minimum Stok</Text>
              <View style={styles.minStokContainer}>
                <Ionicons name="alert-circle-outline" size={20} color="black" style={styles.iconInfo} />
                <TextInput 
                  style={styles.inputMinStok}
                  keyboardType="numeric"
                  value={minStok}
                  onChangeText={setMinStok}
                  placeholder='0'
                  placeholderTextColor='#999'
                />
              </View>
            </View>

            {/* Upload Foto */}
            <TouchableOpacity style={styles.uploadBox} onPress={ambilGambar}>
                {gambarUri ? (
                    <View style={styles.previewContainer}>
                        <Image 
                            // GABUNGKAN path relatif dengan documentDirectory
                            source={{ uri: `${FileSystem.documentDirectory}${gambarUri}` }} 
                            style={styles.previewImage} 
                            contentFit="cover" // Jika pakai expo-image
                            resizeMode="resize" // Jika pakai Image standar
                        />
                        <View style={styles.changeBadge}>
                            <Ionicons name="sync" size={14} color="white" />
                            <Text style={styles.changeText}>Ganti Foto</Text>
                        </View>
                    </View>
                ) : (
                    <View style={styles.placeholderContainer}>
                        <Ionicons name="camera-outline" size={isTablet ? 70 : 50} color="#999" />
                        <Text style={styles.uploadText}>Ketuk untuk ambil foto</Text>
                    </View>
                )}
            </TouchableOpacity>

            {/* Tombol Simpan */}
            <TouchableOpacity style={styles.btnSimpan} onPress={handleSimpan}>
              <Text style={styles.btnSimpanText}>SIMPAN</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnBatal} onPress={handleBatal}>
              <Text style={styles.btnSimpanText}>BATAL</Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 20,
  },
  formContainer: {
    width: isTablet ? '60%' : '90%', // Responsif: Lebih ramping di tablet
    maxWidth: 600,
  },
  inputGroup: {
    position: 'relative',
    marginBottom: 20,
  },
  label: {
    position: 'absolute',
    top: -12,
    left: 12,
    backgroundColor: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
    zIndex: 1
  },
  labelMinStok: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
    marginLeft: 9
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    fontSize: 16,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
  },
  dropdownText: {
    color: '#999',
    fontSize: 16,
  },
  minStokContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 25, // Membuat lonjong seperti di gambar
    width: 120,
    height: 50,
    paddingHorizontal: 10,
  },
  iconInfo: {
    marginRight: 10,
  },
  inputMinStok: {
    fontSize: 18,
    flex: 1,
    textAlign: 'center',
  },
  btnSimpan: {
    backgroundColor: '#000',
    borderRadius: 12,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    // Agar tombol tidak terlalu lebar di tablet
    alignSelf: isTablet ? 'flex-end' : 'stretch',
    paddingHorizontal: isTablet ? 40 : 0,
  },
  btnBatal: {
    backgroundColor: '#bab7b7',
    borderRadius: 12,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    // Agar tombol tidak terlalu lebar di tablet
    alignSelf: isTablet ? 'flex-end' : 'stretch',
    paddingHorizontal: isTablet ? 40 : 0,
  },
  btnSimpanText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
  
  uploadBox: {
        width: '100%',
        // Aspect ratio 4:3 agar konsisten di semua layar
        aspectRatio: isTablet ? 16 / 9 : 4 / 3, 
        backgroundColor: '#F2F2F2',
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#DDD',
        borderStyle: 'dashed', // Memberi kesan "area upload"
        overflow: 'hidden', // Penting agar gambar tidak keluar dari border radius
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    previewContainer: {
        width: '100%',
        height: '100%',
    },
    previewImage: {
        width: '100%',
        height: '100%',
    },
    placeholderContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    uploadText: {
        marginTop: 10,
        fontSize: isTablet ? 18 : 14,
        color: '#888',
        fontWeight: '500',
    },
    changeBadge: {
        position: 'absolute',
        bottom: 12,
        right: 12,
        backgroundColor: 'rgba(0,0,0,0.6)', // Semi transparan hitam
        flexDirection: 'row',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        alignItems: 'center',
    },
    changeText: {
        color: 'white',
        fontSize: 12,
        marginLeft: 5,
        fontWeight: 'bold',
    },
});