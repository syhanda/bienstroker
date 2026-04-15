import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    ScrollView,  
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getPemasukanDetail } from '../../database/pemasukan';

// Deteksi Layar Tablet
const { width } = Dimensions.get('window');
const isTablet = width > 600;

export default function DetailStokMasukScreen({ route }) {
    const { id } = route.params ?? {};
    const [stokMasukData, setStokMasukData] = useState([]);

    useEffect(() => {
      let isActive = true;

      async function loadData() {
          const result = await getPemasukanDetail(id);
          
          if (isActive) setStokMasukData(result ?? []);
      }

      loadData();
      return () => {
          isActive = false;
      }
    }, []);

    // Komponen untuk Baris Tabel (Row) agar kode bersih
    const TableRow = ({ item, isHeader = false }) => (
        <View style={[styles.tableRow, isHeader && styles.tableHeaderBg]}>
            {/* Kolom Nama Barang */}
            <View style={[styles.cell, styles.colNama, !isHeader && styles.borderRightCell]}>
                <Text style={[styles.cellText, isHeader && styles.headerText]} numberOfLines={2}>
                    {item.bahan_nama}
                </Text>
            </View>
            
            {/* Kolom Jumlah */}
            <View style={[styles.cell, styles.colJumlah, !isHeader && styles.borderRightCell]}>
                <Text style={[styles.cellText, isHeader && styles.headerText]}>
                    {item.jumlah}
                </Text>
            </View>

            {/* Kolom Satuan */}
            <View style={[styles.cell, styles.colSatuan, !isHeader && styles.borderRightCell]}>
                <Text style={[styles.cellText, isHeader && styles.headerText]}>
                    {item.satuan}
                </Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* --- 1. HEADER CARD (Responsif) --- */}
                <View style={styles.headerCard}>
                    <View style={styles.headerLeft}>
                        <MaterialCommunityIcons name="archive-arrow-down-outline" size={30} color="black" />
                        <Text style={styles.headerTitle}>Stok Masuk</Text>
                    </View>
                    <Text style={styles.headerDate}>{stokMasukData.tanggal}</Text>
                </View>

                {/* --- 2. TABEL DATA (Responsif & Bergaris) --- */}
                <View style={styles.tableWrapper}>
                    <View style={styles.tableContainer}>
                        {/* Header Tabel (Data Statis) */}
                        <TableRow 
                            item={{ nama: 'Nama Barang', jumlah: 'Jumlah', satuan: 'Satuan' }} 
                            isHeader={true} 
                        />

                        {/* Isi Tabel (Looping Data) */}
                        {stokMasukData.items?.map((item, index) => (
                            <TableRow 
                                key={index} 
                                item={item} 
                                isHeader={false}
                            />
                        ))}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

// --- STYLING (CSS) ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    scrollContent: {
        paddingBottom: 40,
        // Responsif Tablet: Jaga konten di tengah
        alignSelf: 'center',
        width: '100%',
        maxWidth: 800, // Batas maksimal lebar konten di tablet
    },
    
    // --- Header Card Style ---
    headerCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'white',
        marginHorizontal: 20,
        paddingVertical: 18,
        paddingHorizontal: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#000',
        elevation: 4, // Shadow Android
        shadowColor: '#000', // Shadow iOS
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        marginBottom: 30,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: isTablet ? 22 : 20,
        fontWeight: 'bold',
        marginLeft: 15,
        color: 'black',
    },
    headerDate: {
        fontSize: isTablet ? 18 : 16,
        color: '#333',
        fontWeight: '500',
    },

    // --- Table General Style ---
    tableWrapper: {
        paddingHorizontal: 20,
    },
    tableContainer: {
        borderWidth: 1,
        borderColor: '#000', // Border Luar Tabel Hitam Tegas
        backgroundColor: 'white',
    },
    
    // --- Table Row Style ---
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1, // Garis Horizontal antar baris
        borderColor: '#E0E0E0', 
    },
    tableHeaderBg: {
        backgroundColor: '#1A1A1A', // Background Header Hitam Pekat
        borderBottomWidth: 1,
        borderColor: '#000', // Garis pemisah header-isi lebih tegas
    },
    
    // --- Cell & Border Style ---
    cell: {
        paddingVertical: isTablet ? 15 : 12,
        paddingHorizontal: 8,
        justifyContent: 'center',
    },
    borderRightCell: {
        borderRightWidth: 1, // Garis Vertikal antar kolom
        borderColor: '#E0E0E0',
    },
    
    // --- Text Style ---
    cellText: {
        fontSize: isTablet ? 15 : 13,
        color: 'black',
        textAlign: 'left',
    },
    headerText: {
        color: 'white', // Text header putih
        fontWeight: 'bold',
        textAlign: 'center', // Header dibuat tengah
        fontSize: isTablet ? 16 : 14,
    },

    // --- Kolom Width (Persentase agar Responsif) ---
    colNama: {
        flex: 3, // Paling lebar
    },
    colJumlah: {
        flex: 1.2,
        alignItems: 'center', // Isinya di tengah
    },
    colSatuan: {
        flex: 1.2,
        alignItems: 'center',
    },
    colDeskripsi: {
        flex: 2.5, // Lebar untuk deskripsi
    },
});














// import { useEffect, useState } from 'react';
// import { View, Text, FlatList, StyleSheet } from 'react-native';
// import { getPemasukanDetail } from '../../database/pemasukan';

// export default function PemasukanBarangDetail({ route }) {
//   const { id } = route.params ?? {}; 
//   const [listPemasukan, setListPemasukan] = useState([]);

  // useEffect(() => {
  //   let isActive = true;

  //   async function loadData() {
  //       const result = await getPemasukanDetail(id);
        
  //       if (isActive) setListPemasukan(result ?? []);
  //   }

  //   loadData();
  //   return () => {
  //       isActive = false;
  //   }
  // }, []);

//   const renderItem = ({ item }) => (
//     <View style={styles.card}>
//       <View style={styles.info}>
//         <Text style={styles.namaBahan}>{item.bahan_nama}</Text>
//       </View>
//       <View style={styles.jumlahContainer}>
//         <Text style={styles.jumlahText}>+{item.jumlah} pcs</Text>
//       </View>
//     </View>
//   );

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <Text style={styles.label}>Pemasukan Tanggal:</Text>
//     <Text style={styles.tanggalValue}>{listPemasukan.tanggal}</Text>
//       </View>

//       <FlatList
//         data={listPemasukan.items}
//         keyExtractor={(item, index) => index.toString()}
//         renderItem={renderItem}
//         ListEmptyComponent={
//           <Text style={styles.empty}>Tidak ada pemasukan barang pada tanggal ini.</Text>
//         }
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#f8f9fa', padding: 16 },
//   header: { marginBottom: 20, padding: 15, backgroundColor: '#fff', borderRadius: 10, elevation: 2 },
//   label: { fontSize: 14, color: '#666' },
//   tanggalValue: { fontSize: 18, fontWeight: 'bold', color: '#333' },
//   card: {
//     flexDirection: 'row',
//     backgroundColor: '#fff',
//     padding: 15,
//     borderRadius: 10,
//     marginBottom: 10,
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     elevation: 1
//   },
//   namaBahan: { fontSize: 16, fontWeight: '600' },
//   keterangan: { fontSize: 12, color: '#888', marginTop: 4 },
//   jumlahContainer: { backgroundColor: '#eeffeb', padding: 8, borderRadius: 5 },
//   jumlahText: { color: '#4CAF50', fontWeight: 'bold' },
//   empty: { textAlign: 'center', marginTop: 50, color: '#999' }
// });