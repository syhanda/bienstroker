import React, { useState } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const isTablet = width > 600;

const COLORS = {
  primary: '#10B981',      // Emerald Green
  primaryLight: '#F0FDFA', // Mint Background
  textDark: '#064E3B',     // Hijau Gelap
  border: '#D1FAE5',       // Abu-abu halus
  placeholder: '#94A3B8',
  white: '#FFFFFF',
};

const DropdownComponent = ({
  data,
  value,
  onChange,
  placeholder,
  label = "label",
  val = "value",
  isTablet = true,
  style,
  styleSelectedText
}) => {
  const [isFocus, setIsFocus] = useState(false);

  return (
    <View style={styles.container}>
      <Dropdown
        style={[
          styles.dropdown,
          isFocus && styles.dropdownFocus,
          isTablet && styles.dropdownTablet,
          style
        ]}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={[styles.selectedTextStyle, styleSelectedText]}
        inputSearchStyle={styles.inputSearchStyle}
        containerStyle={styles.listContainer} // Style untuk popup list
        itemTextStyle={styles.itemText}
        activeColor={COLORS.primaryLight} // Warna saat item dipilih di list
        iconStyle={styles.iconStyle}
        data={data}
        maxHeight={200}
        labelField={label}
        valueField={val}
        placeholder={!isFocus ? placeholder : '...'}
        value={value}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChange={item => {
          onChange(item[val]);
          setIsFocus(false);
        }}
        renderRightIcon={() => (
          <Ionicons
            name={isFocus ? "chevron-up" : "chevron-down"}
            size={isTablet ? 22 : 18}
            color={isFocus ? COLORS.primary : COLORS.placeholder}
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
    marginBottom: 12,
    width: '100%',
  },
  dropdown: {
    height: 55,
    borderColor: COLORS.border,
    borderWidth: 1.5,
    borderRadius: 15,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  dropdownFocus: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
    elevation: 4,
  },
  dropdownTablet: {
    height: 60,
    borderRadius: 18,
  },
  placeholderStyle: {
    fontSize: isTablet ? 17 : 15,
    color: COLORS.placeholder,
    fontWeight: '500',
  },
  selectedTextStyle: {
    fontSize: isTablet ? 17 : 15,
    color: COLORS.textDark,
    fontWeight: '600',
  },
  listContainer: {
    borderRadius: 15,
    marginTop: 5,
    padding: 8,
    borderWidth: 0,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  itemText: {
    fontSize: isTablet ? 16 : 14,
    color: COLORS.textDark,
  },
  inputSearchStyle: {
    height: 45,
    fontSize: 16,
    borderRadius: 10,
    borderColor: COLORS.border,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
});