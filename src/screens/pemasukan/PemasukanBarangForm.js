import React, { useState, useEffect, useCallback } from 'react';
import {
	View,
	Text,
	StyleSheet,
	FlatList,
	TouchableOpacity,
	Alert,
	Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TanggalInputComponent from '../../components/TanggalInputComponent';
import MoadalInputBahan from '../../components/ModalInputBahan';
import { getAllBahan } from '../../database/bahan';
import { insertPemasukan } from '../../database/pemasukan';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sendLowStockNotification } from '../../components/StockNotification';
import { useSubmitGuard } from '../../hooks/submitGuard';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const isTablet = width > 600;

const COLORS = {
	primary: '#10B981',      // Emerald Green
	primaryLight: '#F0FDFA', // Background Mint
	textDark: '#064E3B',     // Hijau Gelap
	white: '#FFFFFF',
	danger: '#EF4444',
	border: '#E2E8F0',
	slate: '#64748B'
};

export default function PemasukanBarangForm({ navigation }) {
	const [tanggal, setTanggal] = useState(new Date());
	const [keranjangPemasukan, setKeranjangPemasukan] = useState([]);
	const [modalVisible, setModalVisible] = useState(false);
	const [daftarBahanDB, setDaftarBahanDB] = useState([]);
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

		const itemBaru = {
			id: Date.now(),
			bahanId: selectedId,
			nama: bahan.nama,
			satuan: bahan.satuan,
			jumlah: jumlah
		};

		setKeranjangPemasukan(prev => [...prev, itemBaru]);
		setModalVisible(false);

	};

	const hapusItem = (id) => {
		setKeranjangPemasukan(prev => prev.filter(item => item.id !== id));
	};

	const simpanTransaksi = async () => {
		if (keranjangPemasukan.length === 0) return Alert.alert("Kosong", "Isi bahan terlebih dahulu!");

		const tglFormatted = tanggal.toISOString().split('T')[0];

		const newPemasukan = {
			tanggal: tglFormatted,
			items: keranjangPemasukan
		}

		try {
			const result = await insertPemasukan(newPemasukan);
			if (!result) return Alert.alert("Gagal", "Ada kesalahan");

			const allBahan = await getAllBahan();
			let minItems = [];
			allBahan.forEach(item => {
				if (item.stok <= item.min_stok) { minItems.push(item.nama); }
			});

			await AsyncStorage.removeItem("last_notif");
			await sendLowStockNotification(minItems);

			Alert.alert("Berhasil", "Stok barang berhasil dicatat.", [
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

	return (
		<SafeAreaView edges={['left', 'right']} style={styles.container}>
			<View style={styles.responsiveWrapper}>

				{/* --- BAGIAN KONTROL (Kiri di Tablet, Atas di HP) --- */}
				<View style={styles.controlSection}>
					<View style={styles.cardHeader}>
						<Text style={styles.sectionTitle}>Input Transaksi</Text>
						<View style={styles.dateContainer}>
							<TanggalInputComponent
								label="Tanggal Pemasukan"
								onDateChange={(tgl) => setTanggal(tgl)}
							// Pastikan komponen ini mengikuti warna Emerald
							/>
						</View>

						<TouchableOpacity
							style={styles.btnAdd}
							onPress={() => setModalVisible(true)}
							activeOpacity={0.7}
						>
							<Text style={styles.btnAddText}>PILIH BARANG</Text>
						</TouchableOpacity>
					</View>
				</View>

				{/* --- BAGIAN DAFTAR (Kanan di Tablet, Bawah di HP) --- */}
				<View style={styles.listSection}>
					<View style={styles.listHeaderRow}>
						<Text style={styles.sectionTitle}>Item Terpilih ({keranjangPemasukan.length})</Text>
					</View>

					<FlatList
						data={keranjangPemasukan}
						keyExtractor={(item) => item.id.toString()}
						renderItem={({ item }) => (
							<View style={styles.cardItem}>
								<View style={styles.iconBox}>
									<Ionicons name="cube" size={24} color={COLORS.primary} />
								</View>
								<View style={styles.itemInfo}>
									<Text style={styles.namaBahan}>{item.nama}</Text>
									<Text style={styles.jumlahBahan}>+{item.jumlah} {item.satuan}</Text>
								</View>
								<TouchableOpacity
									onPress={() => hapusItem(item.id)}
									style={styles.btnHapus}
								>
									<Ionicons name="trash-outline" color={COLORS.danger} size={20} />
								</TouchableOpacity>
							</View>
						)}
						ListEmptyComponent={
							<View style={styles.emptyContainer}>
								<Ionicons name="cart-outline" size={60} color="#CBD5E1" />
								<Text style={styles.empty}>Belum ada barang terpilih.</Text>
							</View>
						}
						contentContainerStyle={styles.flatListContent}
					/>
				</View>
			</View>

			{/* --- FOOTER SIMPAN --- */}
			<View style={styles.footer}>
				<View style={styles.footerContent}>
					<TouchableOpacity
						style={[styles.btnSimpan, isSubmitting && { opacity: 0.7 }]}
						disabled={isSubmitting}
						onPress={() => withGuard(simpanTransaksi)}
					>
						<Text style={styles.btnSimpanText}>
							{isSubmitting ? 'SIMPAN' : 'KONFIRMASI PEMASUKAN'}
						</Text>
					</TouchableOpacity>
				</View>
			</View>

			{modalVisible && (
				<MoadalInputBahan
					visible={modalVisible}
					onClose={() => setModalVisible(false)}
					onSelect={tambahKeDaftar}
					data={daftarBahanDB}
					mode="pemasukan"
				/>
			)}
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: COLORS.primaryLight
	},
	responsiveWrapper: {
		flex: 1,
		flexDirection: isTablet ? 'row' : 'column',
		paddingHorizontal: isTablet ? 30 : 15,
		paddingTop: 15,
		gap: isTablet ? 25 : 0,
	},
	// Sisi Kiri (Tablet)
	controlSection: {
		flex: isTablet ? 0.4 : 0,
		width: '100%',
	},
	// Sisi Kanan (Tablet)
	listSection: {
		flex: isTablet ? 0.6 : 1,
		width: '100%',
	},
	cardHeader: {
		backgroundColor: COLORS.white,
		padding: 20,
		borderRadius: 20,
		borderWidth: 1,
		borderColor: COLORS.border,
		marginBottom: 15,
	},
	sectionTitle: {
		fontSize: 14,
		fontWeight: 'bold',
		color: COLORS.slate,
		marginBottom: 15,
		textTransform: 'uppercase',
		letterSpacing: 1,
	},
	dateContainer: {
		marginBottom: 20,
	},
	btnAdd: {
		backgroundColor: COLORS.primaryLight,
		flexDirection: 'row',
		paddingVertical: 15,
		paddingHorizontal: 15,
		borderRadius: 15,
		borderWidth: 1,
		borderColor: COLORS.primary,
		alignItems: 'center',
		justifyContent: 'center'
	},
	btnAddText: {
		color: COLORS.primary,
		fontWeight: '900',
		fontSize: 13
	},
	listHeaderRow: {
		paddingHorizontal: 5,
		marginBottom: 10,
		marginTop: isTablet ? 0 : 10,
	},
	flatListContent: {
		paddingBottom: 120
	},
	cardItem: {
		backgroundColor: COLORS.white,
		padding: 15,
		borderRadius: 18,
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 12,
		borderWidth: 1,
		borderColor: COLORS.border,
		elevation: 2,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.05,
		shadowRadius: 5,
	},
	iconBox: {
		width: 45,
		height: 45,
		backgroundColor: COLORS.primaryLight,
		borderRadius: 12,
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 15,
	},
	itemInfo: {
		flex: 1,
	},
	namaBahan: {
		fontSize: 16,
		fontWeight: 'bold',
		color: COLORS.textDark
	},
	jumlahBahan: {
		fontSize: 14,
		color: COLORS.primary,
		fontWeight: '700',
		marginTop: 2
	},
	btnHapus: {
		padding: 10,
	},
	emptyContainer: {
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: 60,
	},
	empty: {
		textAlign: 'center',
		marginTop: 15,
		color: COLORS.slate,
		fontStyle: 'italic'
	},
	footer: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		backgroundColor: COLORS.white,
		borderTopLeftRadius: 30,
		borderTopRightRadius: 30,
		elevation: 20,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: -10 },
		shadowOpacity: 0.1,
		shadowRadius: 10,
	},
	footerContent: {
		padding: 20,
		paddingBottom: 30,
		maxWidth: isTablet ? 600 : '100%',
		alignSelf: 'center',
		width: '100%',
	},
	btnSimpan: {
		backgroundColor: COLORS.primary,
		height: 60,
		borderRadius: 18,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		elevation: 5,
	},
	btnSimpanText: {
		color: COLORS.white,
		fontSize: 16,
		fontWeight: 'bold',
		letterSpacing: 0.5
	}
});
