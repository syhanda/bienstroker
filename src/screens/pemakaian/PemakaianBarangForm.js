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
import { insertPemakaian } from '../../database/pemakaian';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sendLowStockNotification } from '../../components/StockNotification';
import { useSubmitGuard } from '../../hooks/submitGuard';
import { Ionicons } from '@expo/vector-icons';

export default function PemakaianBarangForm() {
  const [tanggal, setTanggal] = useState(new Date());
  const [keranjangPemakaian, setKeranjangPemakaian] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [daftarBahanDB, setDaftarBahanDB] = useState([]);
  const navigation = useNavigation();
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
    
    if (bahan.stok < jumlah) {
        Alert.alert("Stok Tidak Cukup", `Sisa stok ${bahan.nama} hanya ${bahan.stok}`);
        return;
    }

    const itemBaru = {
      id: Date.now(),
      bahanId: selectedId,
      nama: bahan.nama,
      jumlah: jumlah
    };

    setKeranjangPemakaian(prev => [...prev, itemBaru]);
    setModalVisible(false);
    
  };

  const hapusItem = (id) => {
    setKeranjangPemakaian(prev => prev.filter(item => item.id !== id));
  };

  const simpanTransaksi = async () => {
    if (keranjangPemakaian.length === 0) return Alert.alert("Kosong", "Isi bahan yang dipakai!");

    const tglFormatted = tanggal.toISOString().split('T')[0];

    const newPemakaian = {
        tanggal: tglFormatted,
        items: keranjangPemakaian
    }

    try {
        const result = await insertPemakaian(newPemakaian);
        if (!result) return Alert.alert("Gagal", "Ada kesalahan");

        const allBahan = await getAllBahan();
        let minItems = [];
        allBahan.forEach(item => {
          if (item.stok <= item.min_stok) { minItems.push(item.nama); }
        });
        await AsyncStorage.removeItem("last_notif");
        await sendLowStockNotification(minItems);

        Alert.alert("Berhasil", "Pemakaian barang telah dicatat.", [
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
// #ed3535
  return (
    <SafeAreaView edges={['left', 'right']} style={styles.container}>
        <View style={styles.section}>
            <TanggalInputComponent 
            label="Pilih Tanggal Pemakaian" 
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
            data={keranjangPemakaian}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
            <View style={styles.cardItem}>
                <View>
                    <Text style={styles.namaBahan}>{item.nama}</Text>
                    <Text style={styles.jumlahBahan}>{item.jumlah} Pcs digunakan</Text>
                </View>
                <TouchableOpacity onPress={() => hapusItem(item.id)}>
                    <Ionicons name={"trash"} color='#000000' size={22} />
                </TouchableOpacity>
            </View>
            )}
            ListEmptyComponent={<Text style={styles.empty}>Belum ada bahan terpilih.</Text>}
            contentContainerStyle={{ paddingBottom: 100 }}
        />

        <View style={styles.footer}>
            <TouchableOpacity style={styles.btnSimpan} disabled={isSubmitting} onPress={() => withGuard(simpanTransaksi)}>
            <Text style={styles.btnSimpanText}>{isSubmitting ? 'Menyimpan...' : 'Simpan Pemakaian'}</Text>
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
  container: { flex: 1, backgroundColor: '#F8F9FA', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 20 },
  sectionLabel: { fontSize: 16, fontWeight: 'bold', color: '#555' },
  listHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 10
  },
  btnAdd: { backgroundColor: '#000', paddingVertical: 9, paddingHorizontal: 12, borderRadius: 8 },
  btnAddText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
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
  btnSimpan: { backgroundColor: '#000', padding: 16, borderRadius: 12, alignItems: 'center' },
  btnSimpanText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});