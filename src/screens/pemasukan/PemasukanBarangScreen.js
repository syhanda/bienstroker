import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAllPemasukan } from '../../database/pemasukan';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from '../../AuthContext';

const { width } = Dimensions.get('window');
const isTablet = width > 600;
const numColumns = isTablet ? 2 : 1; // 2 Kolom untuk tablet, 1 untuk HP

const COLORS = {
  primary: '#10B981',      // Emerald Green
  primaryLight: '#F0FDFA', // Background Mint
  textDark: '#064E3B',     // Hijau Gelap
  white: '#FFFFFF',
  border: '#E2E8F0',
  slate: '#64748B',
  accent: '#D1FAE5'
};

export default function PemasukanBarangScreen({ navigation }) {
  const [riwayatPemasukan, setRiwayatPemasukan] = useState([]);
  const { user } = useContext(AuthContext);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      let riwayat = [];

      async function loadData() {
        const result = await getAllPemasukan() ?? [];

        result.forEach(item => {
          const pemasukan = {
            tanggal: item.tanggal,
            total: item.total
          };

          riwayat.push(pemasukan);
        });

        if (isActive) setRiwayatPemasukan(riwayat);
      }

      loadData();

      return () => {
        isActive = false;
      };
    }, [])
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.7} onPress={() => navigation.navigate('pemasukanDetail', { tanggal: item.tanggal })}>
      <View style={styles.iconCircle}>
        <Ionicons name="arrow-down-circle" size={24} color={COLORS.primary} />
      </View>
      <View style={styles.content}>
        <Text style={styles.tglText}>
          <Ionicons name="calendar-outline" size={14} /> {item.tanggal}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={18} color="black" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView edges={['left', 'right']} style={styles.container}>
      <View style={styles.header}>
        {user.level === 'admin' && (
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('pemasukanForm')}
          >
            <Ionicons style={styles.btnIcon} name="add-circle" size={22} color={COLORS.white} />
            <Text style={styles.btnText}>Tambah Pemasukan</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={riwayatPemasukan}
        key={isTablet ? 'tablet' : 'mobile'} // Memaksa re-render jika kolom berubah
        numColumns={numColumns}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listPadding}
        columnWrapperStyle={isTablet ? styles.columnWrapper : null}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={5}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={80} color={COLORS.border} />
            <Text style={styles.emptyText}>Belum ada catatan pemasukan.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryLight
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: COLORS.primaryLight,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 15,
    alignSelf: 'flex-start', // Agar tombol tidak lebar penuh
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  btnText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 15,
    marginLeft: 5
  },
  listPadding: {
    paddingHorizontal: 15,
    paddingBottom: 40
  },
  columnWrapper: {
    justifyContent: 'space-between',
    gap: 15, // Jarak antar kolom di tablet
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    flex: 1, // Penting untuk layout kolom di tablet
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  iconCircle: {
    width: 45,
    height: 45,
    backgroundColor: COLORS.accent,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  content: {
    flex: 1
  },
  tglText: {
    fontSize: 14,
    color: COLORS.slate,
    marginTop: 4,
    fontWeight: '500'
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 120
  },
  emptyText: {
    color: COLORS.slate,
    fontSize: 16,
    marginTop: 15,
    fontWeight: '500'
  }
});

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#F5F7FA' },
//   header: {
//     paddingHorizontal: 20,
//     paddingTop: 15,
//     backgroundColor: '#F3F6FA',
//   },
//   actionBtn: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#E3F2FD',
//     alignItems: 'center',
//     paddingVertical: 10,
//     paddingHorizontal: 15,
//     borderRadius: 10,
//     width: '18%',
//   },
//   btnText: {
//     color: '#000',
//     fontWeight: 'bold',
//     fontSize: 14
//   },
//   btnIcon: {
//     marginRight: 3,
//   },
//   title: { fontSize: 22, fontWeight: 'bold', color: '#333' },
//   listPadding: { padding: 15, paddingBottom: 30 },
//   card: {
//     backgroundColor: '#FFF',
//     borderRadius: 12,
//     padding: 15,
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 10,
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 3,
//   },
//   listIcon: {
//     marginRight: 8
//   },
//   content: { flex: 1 },
//   namaBahan: { fontSize: 16, fontWeight: 'bold', color: '#333' },
//   tglText: { fontSize: 14, color: '#484848', marginTop: 2 },
//   detailText: { fontSize: 12, color: '#999' },
//   jumlahContainer: { alignItems: 'flex-end' },
//   jumlahText: { fontSize: 16, fontWeight: 'bold', color: '#4CAF50' },
//   unitText: { fontSize: 10, color: '#999', textTransform: 'uppercase' },
//   emptyState: { alignItems: 'center', marginTop: 100 },
//   emptyText: { color: '#999', fontSize: 16 }
// });