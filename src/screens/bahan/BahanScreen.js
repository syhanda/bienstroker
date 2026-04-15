import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getAllBahan } from '../../database/bahan';
import { SafeAreaView } from 'react-native-safe-area-context';
import { sendLowStockNotification } from '../../components/StockNotification';

export default function HalamanBahan() {
  const [daftarBahan, setDaftarBahan] = useState([]);
  const navigation = useNavigation();

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
              {item.stok}{item.satuan}
            </Text>
          </View>
          <Text style={styles.minStok} >Min: {item.min_stok}</Text>
          {isKritis && <Text style={styles.warningText}>⚠️ Perlu Order Lagi!</Text>}
        </View>
        <Text style={styles.panah}>❯</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView edges={['left', 'right']} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.buttonRow}>
          
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: '#000' }]} //'#4CAF50' }]}
            onPress={() => navigation.navigate('bahanForm', { itemId: null })}
          >
            <Text style={styles.btnIcon}>➕</Text>
            <Text style={styles.btnLabel}>Barang Baru</Text>
          </TouchableOpacity>

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
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { padding: 20, backgroundColor: '#FFF', elevation: 2 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between' },
  
  actionBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 10, 
    paddingHorizontal: 15, 
    borderRadius: 10,
    // width: '48%',
    justifyContent: 'center'
  },
  btnIcon: { fontSize: 16, marginRight: 8 },
  btnLabel: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },

  listContent: { padding: 15 },
  card: { 
    backgroundColor: '#FFF', 
    padding: 16, 
    borderRadius: 12, 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardInfo: { flex: 1 },
  namaBahan: { fontSize: 16, fontWeight: 'bold', color: '#444' },
  rowStok: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  labelStok: { fontSize: 14, color: '#777' },
  angkaStok: { fontSize: 14, fontWeight: 'bold' },
  minStok: { fontSize: 12, color: '#999' },
  textAman: { color: '#4CAF50' },
  textBahaya: { color: '#F44336' },
  warningText: { fontSize: 11, color: '#F44336', fontWeight: 'bold', marginTop: 4 },
  panah: { fontSize: 18, color: '#CCC', marginLeft: 10 },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 50 }
});