import React, { useState, useEffect } from 'react';
import { 
    View, Text, TextInput, TouchableOpacity, 
    StyleSheet, Modal, Alert, Dimensions 
} from 'react-native';
import DropdownComponent from './DropdownComponent'; // Sesuaikan path file

const { width } = Dimensions.get('window');
const isTablet = width > 600;

export default function ModalInputBahan({ data, onSelect, visible, onClose }) {
    const [selectedId, setSelectedId] = useState(null);
    const [jumlah, setJumlah] = useState('');
    const [satuanTeks, setSatuanTeks] = useState('');

    // Update satuan otomatis saat bahan dipilih
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
                    {/* Menggunakan CustomDropdown Universal */}
                    <DropdownComponent 
                        data={data}
                        label="nama"  // Sesuaikan dengan key di DB kamu
                        val="id"      // Sesuaikan dengan key di DB kamu
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
                        {/* Menampilkan satuan dinamis */}
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
        backgroundColor: 'rgba(0,0,0,0.5)', // Gelapkan background
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: isTablet ? 500 : '90%', // Batasi lebar di tablet
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
        flex: 1, // Mengambil sisa ruang
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
        gap: 15, // Hanya bekerja di RN versi baru, jika tidak gunakan margin
    },
    btn: {
        flex: 1,
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnBatal: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    btnSimpan: {
        backgroundColor: '#000', // Sesuai tema desain sebelumnya (BienStroker)
    },
    btnTextBatal: {
        color: '#666',
        fontWeight: 'bold',
    },
    btnTextSimpan: {
        color: '#fff',
        fontWeight: 'bold',
    },
});













// import { useEffect, useState } from "react";
// import { Modal, StyleSheet, View, Text, TouchableOpacity, TextInput, Alert } from "react-native";
// import { Picker } from '@react-native-picker/picker';


// export default function MoadalInputBahan({ data, onSelect, visible, onClose }) {
//     const [selected, setSelected] = useState(null);
//     const [jumlah, setJumlah] = useState('');

//     useEffect(() => {
//         if (visible) {
//             setSelected(null);
//             setJumlah('');
//         }
//     }, [visible]);

//     function addToList() {
//         if (!selected) {
//             Alert.alert("Pilih Bahan", "Silakan pilih bahan terlebih dahulu.");
//             return;
//         }

//         const jumlahInt = parseInt(jumlah);

//         if (!jumlah || isNaN(jumlahInt) || jumlahInt <= 0) {
//             Alert.alert("Jumlah Tidak Valid", "Masukkan jumlah yang benar.");
//             return;
//         }

//         onSelect(selected, jumlahInt);
//         setSelected(null);
//         setJumlah('');
//     }

//     function handleClose() {
//         setSelected(null);
//         setJumlah('');
//         onClose();
//     }

//     return (
//         <Modal
//             animationType="fade"
//             visible={visible}
//             transparent={true}
//             onRequestClose={handleClose}
//         >
//             <View style={styles.overlay}>
//                 <View style={styles.modalContainer}>
//                     <Text style={styles.modalTitle}>Input Data Barang</Text>

//                     <Text style={styles.modalLabel}>Pilih Bahan:</Text>
//                     <View style={styles.pickerWrapper}>
//                         <Picker
//                             selectedValue={selected}
//                             onValueChange={(itemValue) => setSelected(itemValue)}
//                             style={styles.pickerStyle}
//                             mode="dropdown"
//                             dropdownIconColor="#2196F3"
//                         >
//                             <Picker.Item label="-- Pilih bahan --" value={null} />
//                             {data.map((item) => (
//                                 <Picker.Item
//                                     key={item.id.toString()}
//                                     label={item.nama}
//                                     value={item.id}
//                                 />
//                             ))}
//                         </Picker>
//                     </View>

//                     <Text style={styles.label}>Jumlah:</Text>
//                     <TextInput
//                         style={styles.modalInput}
//                         value={jumlah}
//                         onChangeText={(value) => {
//                             const cleaned = value.replace(/[^0-9]/g, '');
//                             setJumlah(cleaned);
//                         }}
//                         keyboardType="numeric"
//                     />

//                     <View style={styles.buttonRow}>
//                         <TouchableOpacity
//                             style={[styles.btn, styles.btnBatal]}
//                             onPress={handleClose}
//                         >
//                             <Text style={styles.btnText}>Batal</Text>
//                         </TouchableOpacity>

//                         <TouchableOpacity
//                             style={[styles.btn, styles.btnSimpan]}
//                             onPress={addToList}
//                         >
//                             <Text style={styles.btnText}>Tambah</Text>
//                         </TouchableOpacity>
//                     </View>
//                 </View>
//             </View>
//         </Modal>
//     );
// }

// const styles = StyleSheet.create({
//     overlay: {
//         flex: 1,
//         backgroundColor: 'rgba(0,0,0,0.5)',
//         justifyContent: 'center',
//         alignItems: 'center',
//     },

//     modalContainer: {
//         width: '85%',
//         backgroundColor: 'white',
//         borderRadius: 15,
//         padding: 20,
//         elevation: 5,
//     },

//     modalTitle: {
//         fontSize: 20,
//         fontWeight: 'bold',
//         marginBottom: 20,
//         textAlign: 'center',
//     },

//     modalLabel: {
//         fontSize: 14,
//         color: '#666',
//         marginBottom: 5,
//         fontWeight: '600',
//     },

//     pickerWrapper: {
//         width: '100%', // Menjamin picker punya lebar penuh
//         borderWidth: 1,
//         borderColor: '#ccc',
//         borderRadius: 10,
//         backgroundColor: '#f9f9f9',
//         marginBottom: 15,
//         height: 55, // Mengunci tinggi agar konsisten
//         justifyContent: 'center',
//         overflow: 'hidden', 
//     },

//     pickerStyle: {
//         width: '100%',
//         height: 55,
//         color: '#000',
//     },

//     modalInput: {
//         width: '100%',
//         height: 50,
//         borderWidth: 1,
//         borderColor: '#ccc',
//         borderRadius: 10,
//         paddingHorizontal: 15,
//         marginBottom: 20,
//         fontSize: 16,
//         color: "#000"
//     },

//     buttonRow: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//     },

//     btn: {
//         flex: 1,
//         padding: 15,
//         borderRadius: 10,
//         marginHorizontal: 5,
//         alignItems: 'center',
//     },

//     btnBatal: { backgroundColor: '#FF5252' },
//     btnSimpan: { backgroundColor: '#4CAF50' },
//     btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
// })