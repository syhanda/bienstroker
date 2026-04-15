import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const FilterBulanTahun = ({ onPeriodeChange }) => {
  const [bulan, setBulan] = useState(new Date().getMonth());
  const [tahun, setTahun] = useState(new Date().getFullYear());

  const daftarBulan = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const currentYear = new Date().getFullYear();
  const daftarTahun = [];
  for (let i = currentYear; i >= currentYear - 5; i--) {
    daftarTahun.push(i);
  }

  useEffect(() => {
    const m = (bulan + 1).toString().padStart(2, '0');
    const periodeString = `${tahun}-${m}`;
    onPeriodeChange(periodeString);
  }, [bulan, tahun]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Periode Laporan:</Text>
      
      <View style={styles.row}>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={bulan.toString()}
            onValueChange={(itemValue) => setBulan(parseInt(itemValue))}
            style={{ color: '#000000' }}
          >
            {daftarBulan.map((nama, index) => (
              <Picker.Item key={index} label={nama} value={index.toString()} />
            ))}
          </Picker>
        </View>

        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={tahun.toString()}
            onValueChange={(itemValue) => setTahun(parseInt(itemValue))}
            style={{ color: '#000000' }}
          >
            {daftarTahun.map((thn) => (
              <Picker.Item key={thn} label={thn.toString()} value={thn.toString()} />
            ))}
          </Picker>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: 5, color: '#333' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  pickerWrapper: {
    flex: 0.48,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
  }
});

export default FilterBulanTahun;