import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TanggalInputComponent from '../../components/TanggalInputComponent';
import MoadalInputBahan from '../../components/ModalInputBahan';
import { getAllBahan } from '../../database/bahan';
import { insertPemasukan } from '../../database/pemasukan';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sendLowStockNotification } from '../../components/StockNotification';
import { useSubmitGuard } from '../../hooks/submitGuard';
import { Ionicons } from '@expo/vector-icons';

export default function PemasukanBarangForm({ navigation }) {
  const [tanggal, setTanggal] = useState(new Date());
  const [keranjangPemasukan, setKeranjangPemasukan] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [daftarBahanDB, setDaftarBahanDB] = useState([]);
  const { isSubmitting, withGuard } = useSubmitGuard();

    useFocusEffect(
        useCallback(() => {
            let isActive = true;

            async function loadData() {
              try {
                const result = await getAllBahan();
                if (isActive) setDaftarBahanDB(result ?? []);
              } catch (err) {
                console.error("Gagal load bahan:", err);
              }
            }

            loadData();

            return () => {
                isActive = false;
            }
        }, [])
    );

  const tambahKeDaftar = (selectedId, jumlah) => {
    const bahan = daftarBahanDB.find(b => b.id === selectedId);

    if (!bahan) {
        Alert.alert("Error", "Bahan tidak ditemukan.");
        return;
    }

    const itemBaru = {
      id: Date.now(),
      bahanId: selectedId,
      nama: bahan.nama,
      satuan: bahan.satuan,
      jumlah: jumlah
    };

    setKeranjangPemasukan(prev => [...prev, itemBaru]);
    setModalVisible(false);
    
  };

  const hapusItem = (id) => {
    setKeranjangPemasukan(prev => prev.filter(item => item.id !== id));
  };

  const simpanTransaksi = async () => {
    if (keranjangPemasukan.length === 0) return Alert.alert("Kosong", "Isi bahan terlebih dahulu!");

    const tglFormatted = tanggal.toISOString().split('T')[0];

    const newPemasukan = {
        tanggal: tglFormatted,
        items: keranjangPemasukan
    }

    try {
        const result = await insertPemasukan(newPemasukan);
        if (!result) return Alert.alert("Gagal", "Ada kesalahan");

        const allBahan = await getAllBahan();
        let minItems = [];
        allBahan.forEach(item => {
          if (item.stok <= item.min_stok) { minItems.push(item.nama); }
        });
        await AsyncStorage.removeItem("last_notif");
        await sendLowStockNotification(minItems);

        Alert.alert("Berhasil", "Stok barang berhasil dicatat.", [
            {
                text: "OK",
                onPress: () => navigation.goBack()
            }
        ]);
    } catch (error) {
        console.error(error);
        Alert.alert("Gagal", "Terjadi kesalahan database.");
    }
  };

  return (
    <SafeAreaView edges={['left', 'right']} style={styles.container}>
        <View style={styles.section}>
            <TanggalInputComponent 
            label="Tanggal Pemasukan Barang" 
            onDateChange={(tgl) => setTanggal(tgl)} 
            />
        </View>

        <View style={styles.listHeader}>
            <TouchableOpacity 
              style={styles.btnAdd} 
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.btnAddText}>PILIH BARANG</Text>
            </TouchableOpacity>
        </View>

        <FlatList
            data={keranjangPemasukan}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
            <View style={styles.cardItem}>
                <View>
                    <Text style={styles.namaBahan}>{item.nama}</Text>
                    <Text style={styles.jumlahBahan}>{item.jumlah}{item.satuan} ditambahkan</Text>
                </View>
                <TouchableOpacity onPress={() => hapusItem(item.id)}>
                    <Ionicons name={"trash"} color='#d33131' size={22} />
                </TouchableOpacity>
            </View>
            )}
            ListEmptyComponent={<Text style={styles.empty}>Belum ada bahan terpilih.</Text>}
            contentContainerStyle={{ paddingBottom: 100 }}
        />

        <View style={styles.footer}>
            <TouchableOpacity style={styles.btnSimpan} disabled={isSubmitting} onPress={() => withGuard(simpanTransaksi)}>
            <Text style={styles.btnSimpanText}>{isSubmitting ? 'Menyimpan...' : 'Simpan Pemasukan'}</Text>
            </TouchableOpacity>
        </View>

        {daftarBahanDB.length > 0 && (
            <MoadalInputBahan 
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSelect={tambahKeDaftar}
                data={daftarBahanDB}
            />
        )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA', paddingHorizontal: 20, paddingTop: 15 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 20 },
  sectionLabel: { fontSize: 16, fontWeight: 'bold', color: '#555' },
  listHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 10
  },
  btnAdd: { backgroundColor: '#E0F2F1', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 8 }, //FF9800
  btnAddText: { color: '#1A535C', fontWeight: 'bold', fontSize: 12 },
  cardItem: { 
    backgroundColor: '#FFF', 
    padding: 15, 
    borderRadius: 12, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 10,
    elevation: 2
  },
  namaBahan: { fontSize: 16, fontWeight: 'bold' },
  jumlahBahan: { fontSize: 14, color: '#666' },
  textHapus: { fontSize: 18 },
  empty: { textAlign: 'center', marginTop: 30, color: '#999', fontStyle: 'italic' },
  footer: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    padding: 20, 
    backgroundColor: '#F8F9FA' 
  },
  btnSimpan: { backgroundColor: '#00695C',  padding: 16, borderRadius: 12, alignItems: 'center' }, //4CAF50
  btnSimpanText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});