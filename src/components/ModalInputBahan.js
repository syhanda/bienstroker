import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, Modal, Alert, Dimensions
} from 'react-native';
import DropdownComponent from './DropdownComponent';
import {
    MaterialCommunityIcons

} from '@expo/vector-icons';

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

export default function ModalInputBahan({ data, onSelect, visible, onClose }) {
    const [selectedId, setSelectedId] = useState(null);
    const [jumlah, setJumlah] = useState('');
    const [satuanTeks, setSatuanTeks] = useState('');

    useEffect(() => {
        if (selectedId) {
            const bahanTerpilih = data.find(item => item.id === selectedId);
            setSatuanTeks(bahanTerpilih ? bahanTerpilih.satuan : '');
        } else {
            setSatuanTeks('');
        }
    }, [selectedId, data]);

    useEffect(() => {
        if (visible) {
            setSelectedId(null);
            setJumlah('');
        }
    }, [visible]);

    function addToList() {
        if (!selectedId) {
            Alert.alert("Pilih Barang", "Silakan pilih barang terlebih dahulu.");
            return;
        }

        const jumlahInt = parseInt(jumlah);
        if (!jumlah || isNaN(jumlahInt) || jumlahInt <= 0) {
            Alert.alert("Jumlah Tidak Valid", "Masukkan jumlah yang benar.");
            return;
        }

        onSelect(selectedId, jumlahInt);
        handleClose();
    }

    function handleClose() {
        setSelectedId(null);
        setJumlah('');
        onClose();
    }

    return (
        <Modal
            animationType="fade"
            visible={visible}
            transparent={true}
            onRequestClose={handleClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    {/* Header Modal */}
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Input Data Barang</Text>
                    </View>

                    {/* Label & Dropdown */}
                    <Text style={styles.modalLabel}>Pilih Barang</Text>
                    <DropdownComponent
                        data={data}
                        label="nama"
                        val="id"
                        placeholder="Cari barang..."
                        value={selectedId}
                        onChange={(val) => setSelectedId(val)}
                    />

                    {/* Label & Input Jumlah */}
                    <Text style={styles.modalLabel}>Jumlah</Text>
                    <View style={styles.inputRow}>
                        <TextInput
                            style={styles.modalInput}
                            value={jumlah}
                            placeholder="0"
                            placeholderTextColor={COLORS.placeholder}
                            onChangeText={(value) => setJumlah(value.replace(/[^0-9]/g, ''))}
                            keyboardType="numeric"
                        />
                        {satuanTeks ? (
                            <View style={styles.satuanBadge}>
                                <Text style={styles.satuanText}>{satuanTeks}</Text>
                            </View>
                        ) : null}
                    </View>

                    {/* Button Group */}
                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={[styles.btn, styles.btnBatal]}
                            onPress={handleClose}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.btnTextBatal}>Batal</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.btn, styles.btnSimpan]}
                            onPress={addToList}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.btnTextSimpan}>Tambah</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(50, 50, 50, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: isTablet ? 550 : '90%',
        backgroundColor: COLORS.white,
        borderRadius: 30,
        padding: isTablet ? 35 : 25,
        elevation: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 25,
        gap: 10,
    },
    modalTitle: {
        fontSize: isTablet ? 24 : 20,
        fontWeight: '900',
        textAlign: 'center',
        color: COLORS.textDark,
    },
    modalLabel: {
        fontSize: 13,
        fontWeight: 'bold',
        marginBottom: 8,
        color: COLORS.slate,
        marginTop: 15,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    modalInput: {
        flex: 1,
        borderWidth: 1.5,
        borderColor: COLORS.border,
        borderRadius: 15,
        paddingHorizontal: 15,
        height: isTablet ? 60 : 55,
        fontSize: 18,
        fontWeight: 'bold',
        backgroundColor: '#F9FCFB',
        color: COLORS.textDark,
    },
    satuanBadge: {
        marginLeft: 12,
        paddingHorizontal: 18,
        height: isTablet ? 60 : 55,
        backgroundColor: COLORS.primaryLight,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: COLORS.primary,
    },
    satuanText: {
        fontSize: 16,
        fontWeight: '900',
        color: COLORS.primary,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 35,
        gap: 15,
    },
    btn: {
        flex: 1,
        height: isTablet ? 60 : 55,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        gap: 8,
    },
    btnBatal: {
        backgroundColor: COLORS.white,
        borderWidth: 1.5,
        borderColor: COLORS.border,
    },
    btnSimpan: {
        backgroundColor: COLORS.primary,
        elevation: 4,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    btnTextBatal: {
        color: COLORS.slate,
        fontWeight: 'bold',
        fontSize: 15,
    },
    btnTextSimpan: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: 15,
    },
});