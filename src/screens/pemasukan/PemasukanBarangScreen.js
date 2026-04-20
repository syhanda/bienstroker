import React, { useState, useEffect, useCallback, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAllPemasukan } from '../../database/pemasukan';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from '../../AuthContext';

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
                        id: item.id,
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
    <TouchableOpacity onPress={() => navigation.navigate('pemasukanDetail', { id: item.id })}>
      <View style={styles.card}>
        <MaterialCommunityIcons name="inbox-arrow-down" size={35} color="black" style={styles.listIcon} />
        <View style={styles.content}>
          <Text style={styles.tglText}>{item.tanggal}</Text>
          <Text style={styles.detailText}>Detail</Text>
        </View>
          <Ionicons name="chevron-forward" size={18} color="black" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView edges={['left', 'right']} style={styles.container}>
        <View style={styles.header}>
            {(user.level == 'admin') ? (
              <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('pemasukanForm')}>
                  <Ionicons style={styles.btnIcon} name="add" size={21} color="#00695C" />
                  <Text style={styles.btnText}>Tambah pemasukan</Text>
              </TouchableOpacity>
            ) : (
              <View></View>
            )}
        </View>

        <FlatList
            data={riwayatPemasukan}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listPadding}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={5}
            ListEmptyComponent={
                <View style={styles.emptyState}>
                    <Text style={styles.emptyEmoji}>📔</Text>
                    <Text style={styles.emptyText}>Belum ada catatan pemasukan.</Text>
                </View>
            }
        />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { 
    paddingHorizontal: 20,
    paddingTop: 15,
    backgroundColor: '#F3F6FA', 
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    alignItems: 'center', 
    paddingVertical: 10, 
    paddingHorizontal: 15, 
    borderRadius: 10,
    width: '18%',
  },
  btnText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14
  },
  btnIcon: {
    marginRight: 3,
  },
  title: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  listPadding: { padding: 15, paddingBottom: 30 },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  listIcon: {
    marginRight: 8
  },
  content: { flex: 1 },
  namaBahan: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  tglText: { fontSize: 14, color: '#484848', marginTop: 2 },
  detailText: { fontSize: 12, color: '#999' },
  jumlahContainer: { alignItems: 'flex-end' },
  jumlahText: { fontSize: 16, fontWeight: 'bold', color: '#4CAF50' },
  unitText: { fontSize: 10, color: '#999', textTransform: 'uppercase' },
  emptyState: { alignItems: 'center', marginTop: 100 },
  emptyEmoji: { fontSize: 50, marginBottom: 10 },
  emptyText: { color: '#999', fontSize: 16 }
});