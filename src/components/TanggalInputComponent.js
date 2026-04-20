import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

export default function TanggalInputComponent({label, onDateChange}) {
  const [date, setDate] = useState(new Date()); // Simpan objek tanggal
  const [show, setShow] = useState(false); // Kontrol pop-up kalender
  const [text, setText] = useState('Pilih Tanggal'); // Teks yang ditampilkan di UI

  const onChange = (event, selectedDate) => {
    // Sembunyikan kalender setelah memilih (khusus Android)
    setShow(Platform.OS === 'ios'); 
    
    if (selectedDate) {
      setDate(selectedDate);
      
      // Format tanggal menjadi string yang enak dibaca (Contoh: 28/02/2026)
      let tempDate = new Date(selectedDate);
      let fDate = tempDate.getDate() + '/' + (tempDate.getMonth() + 1) + '/' + tempDate.getFullYear();
      setText(fDate);

      onDateChange(selectedDate);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      
      {/* Tombol pemicu DatePicker */}
      <TouchableOpacity style={styles.inputBox} onPress={() => setShow(true)}>
        <Text style={styles.inputText}>{text}</Text>
        <Ionicons name={"calendar"} color='#1565C0' size={26} />
        {/* <Text style={styles.icon}></Text> */}
      </TouchableOpacity>

      {show && (
        <DateTimePicker
          value={date}
          mode="date" // Bisa ganti "time" untuk jam
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onChange}
          maximumDate={new Date()} // Opsional: Batasi agar tidak bisa pilih masa depan
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 8, color: '#333' },
  inputBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  inputText: { fontSize: 17, color: '#333' },
  icon: { fontSize: 18 }
});