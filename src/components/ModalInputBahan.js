import React, { useState, useEffect } from 'react';
import { 
    View, Text, TextInput, TouchableOpacity, 
    StyleSheet, Modal, Alert, Dimensions 
} from 'react-native';
import DropdownComponent from './DropdownComponent';

const { width } = Dimensions.get('window');
const isTablet = width > 600;

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
            Alert.alert("Pilih Bahan", "Silakan pilih bahan terlebih dahulu.");
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
                    <Text style={styles.modalTitle}>Input Data Barang</Text>

                    <Text style={styles.modalLabel}>Pilih Bahan</Text>
                    <DropdownComponent 
                        data={data}
                        label="nama"
                        val="id"
                        placeholder="Cari bahan..."
                        value={selectedId}
                        onChange={(val) => setSelectedId(val)}
                    />

                    <Text style={styles.modalLabel}>Jumlah</Text>
                    <View style={styles.inputRow}>
                        <TextInput
                            style={styles.modalInput}
                            value={jumlah}
                            placeholder="0"
                            placeholderTextColor="#999"
                            onChangeText={(value) => setJumlah(value.replace(/[^0-9]/g, ''))}
                            keyboardType="numeric"
                        />
                        {satuanTeks ? (
                            <View style={styles.satuanBadge}>
                                <Text style={styles.satuanText}>{satuanTeks}</Text>
                            </View>
                        ) : null}
                    </View>

                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={[styles.btn, styles.btnBatal]}
                            onPress={handleClose}
                        >
                            <Text style={styles.btnTextBatal}>Batal</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.btn, styles.btnSimpan]}
                            onPress={addToList}
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
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: isTablet ? 500 : '90%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 25,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#333',
    },
    modalLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        color: '#666',
        marginTop: 10,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    modalInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 50,
        fontSize: 18,
        backgroundColor: '#f9f9f9',
    },
    satuanBadge: {
        marginLeft: 10,
        paddingHorizontal: 15,
        height: 50,
        backgroundColor: '#eee',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    satuanText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#555',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 30,
        gap: 15,
    },
    btn: {
        flex: 1,
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnBatal: {
        backgroundColor: '#BDC3C7',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    btnSimpan: {
        backgroundColor: '#E0F2F1',
    },
    btnTextBatal: {
        color: '#3c3c3c',
        fontWeight: 'bold',
    },
    btnTextSimpan: {
        color: '#1A535C',
        fontWeight: 'bold',
    },
});