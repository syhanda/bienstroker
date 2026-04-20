import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { Ionicons } from '@expo/vector-icons';

const DropdownComponent = ({ 
  data,
  value, 
  onChange,
  placeholder,
  label = "label",
  val = "value",
  isTablet = true
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
    height: 55,
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