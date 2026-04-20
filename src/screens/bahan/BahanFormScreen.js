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
import { useFocusEffect } from '@react-navigation/native';
import { insertBahan, getBahan, updateBahan} from '../../database/bahan';

const { width } = Dimensions.get('window');
const isTablet = width > 600;

export default function BahanFormScreen({ route, navigation }) {
  const [nama, setNama] = useState('');
  const [satuan, setSatuan] = useState('');
  const [minStok, setMinStok] = useState('');
  const [gambarUri, setGambarUri] = useState(null);
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
                            setGambarUri(result.gambar);
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
            let result;
          
            if (itemId) {   
              result = await updateBahan(itemId, nama, satuan, Number(minStok), gambarUri);
            } else {
              result = await insertBahan(nama, satuan, Number(minStok), gambarUri);
            }
          
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
          
            <View style={styles.formLeft}>
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
            </View>

            <View style={styles.formRight}>
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
              <View style={[styles.inputGroup, { marginTop: -20 } ]}>
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
              </View>

            {/* <TouchableOpacity style={styles.btnBatal} onPress={handleBatal}>
              <Text style={styles.btnBatalText}>BATAL</Text>
            </TouchableOpacity> */}
          </View>
          <TouchableOpacity style={styles.btnSimpan} onPress={handleSimpan}>
            <Text style={styles.btnSimpanText}>SIMPAN</Text>
          </TouchableOpacity>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#F3F6FA',
    alignItems: 'center',
    paddingVertical: 20,
  },
  formContainer: {
    display: 'flex',
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 30
  },
  inputGroup: {
    position: 'relative',
    marginBottom: 30,
  },
  label: {
    position: 'absolute',
    top: -12,
    left: 12,
    backgroundColor: '#F3F6FA',
    fontWeight: 'bold',
    fontSize: 16,
    zIndex: 1
  },
  labelMinStok: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
    marginLeft: 7
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
    borderRadius: 15, // Membuat lonjong seperti di gambar
    width: 80,
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
    backgroundColor: '#00695C',
    borderRadius: 12,
    height: 45,
    width: 120,
    marginRight: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    // Agar tombol tidak terlalu lebar di tablet
    alignSelf: isTablet ? 'flex-end' : 'stretch',
    // paddingHorizontal: isTablet ? 40 : 0,
  },
  btnBatal: {
    backgroundColor: '#BDC3C7',
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
  btnBatalText: {
    color: '#3c3c3c',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
  formLeft: {
    flex: .7,
  },
  formRight: {
    flex: 1,
    marginTop: 18
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