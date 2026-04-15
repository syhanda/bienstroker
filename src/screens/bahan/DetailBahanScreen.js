// import React, { useEffect, useState } from 'react';
// import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
// import { getBahan } from "../../database/bahan";
// import { Ionicons } from '@expo/vector-icons';

// const DetailBahanScreen = ({ route }) => {
//   const { itemId } = route.params ?? {};
//   const [item, setItem] = useState(null);

//   useEffect(() => {
//     loadData();
//   }, [itemId]);

//   const loadData = async () => {
//     try {
//       const result = await getBahan(itemId);
//       setItem(result);
//     } catch (error) {
//       console.error("Gagal memuat detail bahan:", error);
//     }
//   };

//   if (!item) return <View style={styles.loading}><Text>Memuat...</Text></View>;

//   // Logika peringatan stok tipis
//   const isStokKritis = item.stok <= item.stok_minimum;
//   console.log(item.gambar);

//   return (
//     <ScrollView style={styles.container}>
//       {/* Bagian Gambar */}
//       <View style={styles.imageContainer}>
//         {item.foto_uri ? (
//           <Image source={{ uri: item.gambar }} style={styles.image} resizeMode="cover" />
//         ) : (
//           <View style={styles.imagePlaceholder}>
//             <Ionicons name="cube-outline" size={80} color="#ccc" />
//             <Text style={{ color: '#999' }}>Tidak ada gambar</Text>
//           </View>
//         )}
//       </View>

//       {/* Konten Detail */}
//       <View style={styles.content}>
//         <Text style={styles.nama}>{item.nama}</Text>
        
//         {/* Badge Status Stok */}
//         <View style={[styles.badge, { backgroundColor: isStokKritis ? '#ffebee' : '#e8f5e9' }]}>
//           <Text style={[styles.badgeText, { color: isStokKritis ? '#d32f2f' : '#2e7d32' }]}>
//             {isStokKritis ? 'Stok Perlu Ditambah' : 'Stok Aman'}
//           </Text>
//         </View>

//         <View style={styles.section}>
//           <Text style={styles.label}>Deskripsi</Text>
//           <Text style={styles.deskripsi}>{item.deskripsi || 'Tidak ada deskripsi bahan.'}</Text>
//         </View>

//         <View style={styles.row}>
//           <View style={styles.box}>
//             <Text style={styles.label}>Sisa Stok</Text>
//             <Text style={[styles.value, { color: isStokKritis ? '#d32f2f' : '#333' }]}>
//               {item.stok}
//             </Text>
//           </View>
//           <View style={styles.box}>
//             <Text style={styles.label}>Minimum Stok</Text>
//             <Text style={styles.value}>{item.min_stok}</Text>
//           </View>
//         </View>

//         {/* Tombol Aksi */}
//         <TouchableOpacity 
//           style={styles.btnEdit}
//           onPress={() => navigation.navigate('EditBahan', { item })}
//         >
//           <Ionicons name="create-outline" size={20} color="#fff" />
//           <Text style={styles.btnText}>Edit Data Bahan</Text>
//         </TouchableOpacity>
//       </View>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#fff' },
//   loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   imageContainer: { width: '100%', height: 300, backgroundColor: '#f0f0f0' },
//   image: { width: '100%', height: '100%' },
//   imagePlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   content: { padding: 20, borderTopLeftRadius: 25, borderTopRightRadius: 25, marginTop: -20, backgroundColor: '#fff' },
//   nama: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 10 },
//   badge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: 20 },
//   badgeText: { fontSize: 12, fontWeight: 'bold' },
//   section: { marginBottom: 20 },
//   label: { fontSize: 14, color: '#888', marginBottom: 5 },
//   deskripsi: { fontSize: 16, color: '#555', lineHeight: 24 },
//   row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
//   box: { flex: 1, padding: 15, backgroundColor: '#f8f9fa', borderRadius: 12, marginRight: 10, alignItems: 'center' },
//   value: { fontSize: 22, fontWeight: 'bold' },
//   btnEdit: { 
//     flexDirection: 'row', 
//     backgroundColor: '#007bff', 
//     padding: 15, 
//     borderRadius: 12, 
//     justifyContent: 'center', 
//     alignItems: 'center' 
//   },
//   btnText: { color: '#fff', fontWeight: 'bold', marginLeft: 10 }
// });

// export default DetailBahanScreen;

import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';
import { getBahan } from '../../database/bahan';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker'

export default function BahanDetailScreen({ route }) {
    const { itemId } = route.params;
    const [bahan, setBahan] = useState(null);
    const navigation = useNavigation();

    // Mengambil data setiap kali halaman difokuskan (agar update setelah edit)
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
        <ScrollView style={styles.container}>
            {/* Header Gambar */}
            <View style={styles.imageContainer}>
                {bahan.gambar ? (
                    <Image 
                      source={bahan.gambar} // Tidak perlu {{ uri: ... }} cukup string path saja
                      style={styles.image}
                      contentFit="cover" // Pengganti resizeMode
                      transition={200}   // Efek halus saat gambar muncul
                      cachePolicy="none" // Memastikan dia baca file terbaru dari storage
                  />
                ) : (
                    <View style={styles.noImage}>
                        <Text style={styles.noImageText}>Tidak ada foto</Text>
                    </View>
                )}
            </View>

            {/* Konten Detail */}
            <View style={styles.infoCard}>
                <Text style={styles.label}>Nama Bahan</Text>
                <Text style={styles.value}>{bahan.nama}</Text>

                <View style={styles.divider} />

                <Text style={styles.label}>Deskripsi</Text>
                <Text style={styles.deskripsi}>
                    {bahan.deskripsi || 'Tidak ada deskripsi.'}
                </Text>

                <View style={styles.divider} />

                <View style={styles.row}>
                    <View>
                        <Text style={styles.label}>Minimum Stok</Text>
                        <Text style={[styles.value, { color: '#e67e22' }]}>
                            {bahan.min_stok} Unit
                        </Text>
                    </View>
                </View>
            </View>

            {/* Tombol Aksi */}
            <TouchableOpacity 
                style={styles.btnEdit}
                onPress={() => navigation.navigate('BahanForm', { itemId: bahan.id })}
            >
                <Text style={styles.btnEditText}>Edit Bahan</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    imageContainer: {
        width: '100%',
        height: 300, // Beri tinggi tetap (fixed height)
        backgroundColor: '#E1E4E8',
        overflow: 'hidden',
    },
    image: { width: '100%', height: '100%' },
    noImage: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: '#ececec' 
    },
    noImageText: { color: '#999' },
    infoCard: {
        backgroundColor: '#fff',
        margin: 15,
        padding: 20,
        borderRadius: 15,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    label: {
        fontSize: 12,
        color: '#7f8c8d',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 5,
    },
    value: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 15,
    },
    description: {
        fontSize: 16,
        color: '#34495e',
        lineHeight: 24,
        marginBottom: 15,
    },
    divider: {
        height: 1,
        backgroundColor: '#f1f1f1',
        marginBottom: 15,
    },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    btnEdit: {
        backgroundColor: '#3498db',
        marginHorizontal: 15,
        marginBottom: 30,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    btnEditText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});