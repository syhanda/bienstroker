import React, { useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { Ionicons } from '@expo/vector-icons';

const DropdownComponent = ({ 
  data,          // Data yang akan ditampilkan
  value,         // State nilai yang dipilih
  onChange,      // Fungsi untuk mengupdate state
  placeholder,   // Teks saat kosong
  label = "label", // Nama field untuk teks (default: 'label')
  val = "value",   // Nama field untuk id (default: 'value')
  isTablet = true // Penyesuaian style tablet jika perlu
}) => {
  const [isFocus, setIsFocus] = useState(false);

  return (
    <View style={styles.container}>
      <Dropdown
        style={[
          styles.dropdown, 
          isFocus && { borderColor: 'black' },
          isTablet && styles.dropdownTablet
        ]}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        iconStyle={styles.iconStyle}
        data={data}
        maxHeight={300}
        labelField={label}
        valueField={val}
        placeholder={!isFocus ? placeholder : '...'}
        searchPlaceholder="Cari..."
        value={value}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChange={item => {
          onChange(item[val]);
          setIsFocus(false);
        }}
        renderRightIcon={() => (
          <Ionicons 
            name={isFocus ? "caret-up" : "caret-down"} 
            size={18} 
            color="black" 
          />
        )}
      />
    </View>
  );
};

export default DropdownComponent;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    marginBottom: 10,
  },
  dropdown: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
  },
  dropdownTablet: {
    height: 55, // Sedikit lebih besar di tablet
  },
  placeholderStyle: {
    fontSize: 16,
    color: '#999',
  },
  selectedTextStyle: {
    fontSize: 16,
    color: 'black',
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
    borderRadius: 8,
  },
});