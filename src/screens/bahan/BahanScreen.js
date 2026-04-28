import React, { useState, useCallback, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getAllBahan } from '../../database/bahan';
import { SafeAreaView } from 'react-native-safe-area-context';
import { sendLowStockNotification } from '../../components/StockNotification';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from '../../AuthContext';

const COLORS = {
  primary: '#10B981',      // Emerald Green
  primaryLight: '#D1FAE5', // Hijau sangat muda untuk tombol/bg
  textDark: '#064E3B',     // Hijau gelap untuk teks utama
  textMuted: '#64748B',    // Slate untuk teks sekunder
  danger: '#EF4444',       // Merah untuk stok kritis
  warning: '#F59E0B',      // Amber untuk peringatan
  white: '#FFFFFF',
  background: '#F0FDFA',   // Teal sangat muda
};

export default function HalamanBahan({ navigation }) {
  const [daftarBahan, setDaftarBahan] = useState([]);
  const { user } = useContext(AuthContext);

    useFocusEffect(
        useCallback(() => {
            let isActive = true;

            async function loadData() {
                const data = await getAllBahan();
                
                if (isActive) setDaftarBahan(data);
                
                const items = [];
                data.forEach(item => {
                  if (item.stok <= item.min_stok) {
                    items.push(item.name)
                  }
                });

                sendLowStockNotification(items);
            }

            loadData();

            return () => {
                isActive = false;
            }
        }, [])
    );

  const renderItem = ({ item }) => {
    const isKritis = item.stok <= item.min_stok;

    return (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('bahanDetail', { itemId: item.id })}
    >
      <View style={styles.cardInfo}>
        <Text style={styles.namaBahan}>{item.nama}</Text>
        <View style={styles.rowStok}>
          <Text style={styles.labelStok}>Sisa Stok: </Text>
          <Text style={[styles.angkaStok, isKritis ? styles.textBahaya : styles.textAman]}>
            {item.stok} {item.satuan}
          </Text>
        </View>
        <Text style={styles.minStok}>Batas Minimum: {item.min_stok} {item.satuan}</Text>
        {isKritis && (
          <View style={styles.warningBadge}>
            <Text style={styles.warningText}>⚠️ Perlu Order Lagi!</Text>
          </View>
        )}
      </View>
      <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
    </TouchableOpacity>
  );
};

  return (
  <SafeAreaView edges={['left', 'right']} style={styles.container}>
    <View style={styles.header}>
      <View style={styles.buttonRow}>
        {user.level === 'admin' && (
          <TouchableOpacity 
            style={styles.actionBtn}
            onPress={() => navigation.navigate('bahanForm', { itemId: null })}
          >
            <Ionicons style={styles.btnIcon} name="add-circle" size={22} color={COLORS.white} />
            <Text style={styles.btnLabel}>Tambah Barang Baru</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>

    <FlatList
      data={daftarBahan}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
      contentContainerStyle={styles.listContent}
      ListEmptyComponent={
        <Text style={styles.emptyText}>Belum ada bahan didaftarkan.</Text>
      }
    />
  </SafeAreaView>
);

  // return (
  //   <SafeAreaView edges={['left', 'right']} style={styles.container}>
  //     <View style={styles.header}>
  //       <View style={styles.buttonRow}>
          
  //         {(user.level == 'admin') ? (
  //           <TouchableOpacity 
  //             style={styles.actionBtn}
  //             onPress={() => navigation.navigate('bahanForm', { itemId: null })}
  //           >
  //             <Ionicons style={styles.btnIcon} name="add" size={21} color="#00695C" />
  //             <Text style={styles.btnLabel}>Barang Baru</Text>
  //           </TouchableOpacity>
  //         ) : (
  //           <View></View>
  //         )}
          

  //       </View>
  //     </View>

  //     <FlatList
  //       data={daftarBahan}
  //       keyExtractor={(item) => item.id.toString()}
  //       renderItem={renderItem}
  //       contentContainerStyle={styles.listContent}
  //       ListEmptyComponent={
  //         <Text style={styles.emptyText}>Belum ada bahan didaftarkan.</Text>
  //       }
  //     />
  //   </SafeAreaView>
  // );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: COLORS.background,
  },
  buttonRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary, // Tombol hijau solid agar menonjol
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 15,
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  btnIcon: {
    marginRight: 8,
  },
  btnLabel: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 15,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardInfo: {
    flex: 1,
  },
  namaBahan: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: 6,
  },
  rowStok: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  labelStok: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  angkaStok: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  minStok: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  textAman: {
    color: COLORS.primary,
  },
  textBahaya: {
    color: COLORS.danger,
  },
  warningBadge: {
    backgroundColor: '#FFFBEB',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  warningText: {
    color: COLORS.warning,
    fontSize: 11,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 80,
    color: COLORS.textMuted,
    fontSize: 16,
  },
});

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F3F6FA', // Background abu-abu muda dashboard
//   },
//   header: {
//     paddingHorizontal: 20,
//     paddingVertical: 15,
//     backgroundColor: '#F3F6FA',
//   },
//   buttonRow: {
//     flexDirection: 'row',
//     marginBottom: 5,
//   },
//   // --- Styling Tombol "Barang Baru" ---
//   actionBtn: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#E3F2FD', // Biru charcoal dashboard
//     paddingVertical: 10,
//     paddingHorizontal: 16,
//     borderRadius: 12,
//     elevation: 4,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//   },
//   btnIcon: {
//     marginRight: 3,
//   },
//   btnLabel: {
//     color: '#000',
//     fontWeight: 'bold',
//     fontSize: 14,
//   },
//   // --- Styling FlatList & Card ---
//   listContent: {
//     paddingHorizontal: 20,
//     paddingBottom: 20,
//   },
//   card: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#FFFFFF',
//     borderRadius: 18, // Rounded besar agar senada menu dashboard
//     padding: 20,
//     marginBottom: 15,
//     // Box Shadow
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.08,
//     shadowRadius: 6,
//     elevation: 3,
//   },
//   cardInfo: {
//     flex: 1,
//   },
//   namaBahan: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#2C3E50', // Biru charcoal
//     marginBottom: 6,
//   },
//   rowStok: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 4,
//   },
//   labelStok: {
//     fontSize: 14,
//     color: '#7F8C8D',
//   },
//   angkaStok: {
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   minStok: {
//     fontSize: 12,
//     color: '#95A5A6',
//     fontStyle: 'italic',
//   },
//   // --- Indikator Stok ---
//   textAman: {
//     color: '#27AE60', // Hijau seperti card masuk
//   },
//   textBahaya: {
//     color: '#E74C3C', // Merah peringatan
//   },
//   warningText: {
//     color: '#E67E22', // Oranye seperti card stok habis
//     fontSize: 12,
//     fontWeight: 'bold',
//     marginTop: 5,
//   },
//   panah: {
//     fontSize: 18,
//     color: '#BDC3C7',
//     marginLeft: 10,
//   },
//   emptyText: {
//     textAlign: 'center',
//     marginTop: 50,
//     color: '#95A5A6',
//     fontSize: 16,
//   },
// });


// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#F8F9FA' },
//   header: { padding: 20, backgroundColor: '#FFF', elevation: 2 },
//   title: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 15 },
//   buttonRow: { flexDirection: 'row', justifyContent: 'space-between' },
  
//   actionBtn: { 
//     flexDirection: 'row', 
//     alignItems: 'center', 
//     paddingVertical: 10, 
//     paddingHorizontal: 15, 
//     borderRadius: 10,
//     // width: '48%',
//     justifyContent: 'center'
//   },
//   btnIcon: { fontSize: 16, marginRight: 8 },
//   btnLabel: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },

//   listContent: { padding: 15 },
//   card: { 
//     backgroundColor: '#FFF', 
//     padding: 16, 
//     borderRadius: 12, 
//     flexDirection: 'row', 
//     alignItems: 'center', 
//     marginBottom: 12,
//     elevation: 3,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 3,
//   },
//   cardInfo: { flex: 1 },
//   namaBahan: { fontSize: 16, fontWeight: 'bold', color: '#444' },
//   rowStok: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
//   labelStok: { fontSize: 14, color: '#777' },
//   angkaStok: { fontSize: 14, fontWeight: 'bold' },
//   minStok: { fontSize: 12, color: '#999' },
//   textAman: { color: '#4CAF50' },
//   textBahaya: { color: '#F44336' },
//   warningText: { fontSize: 11, color: '#F44336', fontWeight: 'bold', marginTop: 4 },
//   panah: { fontSize: 18, color: '#CCC', marginLeft: 10 },
//   emptyText: { textAlign: 'center', color: '#999', marginTop: 50 }
// });