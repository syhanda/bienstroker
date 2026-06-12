import React, { useState, useEffect, useCallback } from 'react';
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	ScrollView,
	Dimensions,
	Platform,
	Image,
	Alert,
	KeyboardAvoidingView,
	TouchableWithoutFeedback,
	Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import DropdownComponent from '../../components/DropdownComponent';
import { useFocusEffect } from '@react-navigation/native';
import { insertBahan, getBahan, updateBahan } from '../../database/bahan';

const { width } = Dimensions.get('window');
const isTablet = width > 600;

const COLORS = {
	primary: '#10B981',      // Emerald Green
	primaryLight: '#F0FDFA', // Hijau sangat muda (Mint)
	border: '#D1FAE5',       // Warna border hijau pucat
	textDark: '#064E3B',     // Hijau gelap
	placeholder: '#94A3B8',  // Slate
	white: '#FFFFFF',
};

export default function BahanFormScreen({ route, navigation }) {
	const [nama, setNama] = useState('');
	const [satuan, setSatuan] = useState('');
	const [minStok, setMinStok] = useState('');
	const [gambarUri, setGambarUri] = useState(null);
	const { itemId } = route.params ?? {};
	const [isSaved, setIsSaved] = useState(false);

	const dataSatuan = [
		{ label: 'Kilogram (kg)', value: 'kg' },
		{ label: 'Gram (g)', value: 'g' },
		{ label: 'Liter (l)', value: 'l' },
		{ label: 'Mililiter (ml)', value: 'ml' },
		{ label: 'Pcs / Buah', value: 'pcs' },
		{ label: 'Pack / Dus', value: 'pack' },
	];

	useFocusEffect(
		useCallback(() => {
			let isActive = true;

			if (itemId) {
				async function loadData() {
					try {
						const result = await getBahan(itemId);

						if (isActive && result) {
							setNama(result.nama);
							setSatuan(result.satuan)
							setMinStok(result.min_stok.toString());
							setGambarUri(result.gambar);
						}
					} catch (err) {
						console.error("Gagal load bahan:", err);
					}
				}

				loadData();
			}

			return () => {
				cleanupGambar();
				isActive = false;
			}
		}, [itemId])
	);

	async function cleanupGambar() {
		if (gambarUri && !isSaved) {
			const pathAbsolut = `${FileSystem.documentDirectory}${gambarUri}`;

			try {
				const info = await FileSystem.getInfoAsync(pathAbsolut);
				if (info.exists) {
					await FileSystem.deleteAsync(pathAbsolut, { idempotent: true });
					console.log("Cleanup: Gambar sebelumnya telah dihapus.");
				}
			} catch (error) {
				console.error("Gagal melakukan cleanup gambar:", error);
			}
		}
	}

	async function ambilGambar() {
		if (!gambarUri) { cleanupGambar() }
		const hasil = await ImagePicker.launchCameraAsync({
			allowsEditing: false,
			aspect: [1, 1],
		});

		if (!hasil.canceled && hasil.assets[0]) {
			const tempUri = hasil.assets[0].uri;
			const fileName = `bahan_${Date.now()}.jpg`;
			const subFolder = 'gambar_bahan';

			const folderUri = `${FileSystem.documentDirectory}${subFolder}/`;
			const fileUriTujuan = `${folderUri}${fileName}`;

			try {
				// Pastikan folder ada
				const folderInfo = await FileSystem.getInfoAsync(folderUri);
				if (!folderInfo.exists) {
					await FileSystem.makeDirectoryAsync(folderUri, { intermediates: true });
				}

				// Pindahkan file menggunakan API klasik (Anti-Error "Not Absolute")
				await FileSystem.moveAsync({
					from: tempUri,
					to: fileUriTujuan
				});

				// SIMPAN HANYA PATH RELATIF KE DB
				const relativePath = `${subFolder}/${fileName}`;
				setGambarUri(relativePath);

				console.log("Berhasil simpan path relatif:", relativePath);
			} catch (error) {
				console.error("Gagal total di Form:", error);
			}
		}
	}

	async function handleSimpan() {
		if (!nama || !minStok) {
			setIsInvalid(true)
			return;
		}

		try {
			let result;

			if (itemId) {
				result = await updateBahan(itemId, nama, satuan, Number(minStok), gambarUri);
			} else {
				result = await insertBahan(nama, satuan, Number(minStok), gambarUri);
			}

			if (result.changes > 0) {
				setIsSaved(true);
				Alert.alert(
					itemId ? "Berhasil Diubah" : "Berhasil Disimpan",
					`Barang "${nama}" telah dicatat.`,
					[{ text: "OK", onPress: () => navigation.goBack() }]
				);
			}
		} catch (error) {
			console.error(error);
			Alert.alert("Gagal", "Terjadi kesalahan saat menyimpan.");
		}
	}

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			style={{ flex: 1, backgroundColor: COLORS.background }}
		>
			<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
				<ScrollView contentContainerStyle={styles.scrollContainer}>
					<View style={styles.responsiveWrapper}>

						<View style={styles.formContainer}>
							<View style={styles.formLeft}>
								<TouchableOpacity style={styles.uploadBox} onPress={ambilGambar}>
									{gambarUri ? (
										<View style={styles.previewContainer}>
											<Image
												source={{ uri: `${FileSystem.documentDirectory}${gambarUri}` }}
												style={styles.previewImage}
											/>
											<View style={styles.changeBadge}>
												<Ionicons name="sync" size={isTablet ? 18 : 14} color="white" />
												<Text style={styles.changeText}>Ganti Foto</Text>
											</View>
										</View>
									) : (
										<View style={styles.placeholderContainer}>
											<Ionicons name="camera" size={isTablet ? 80 : 50} color={COLORS.primary} />
											<Text style={styles.uploadText}>Ambil Foto Barang</Text>
										</View>
									)}
								</TouchableOpacity>
							</View>

							{/* KANAN: Area Input */}
							<View style={styles.formRight}>
								<View style={styles.inputGroup}>
									<Text style={styles.label}>Nama Barang</Text>
									<TextInput
										style={styles.input}
										placeholder='Contoh: Gula Pasir'
										placeholderTextColor={COLORS.placeholder}
										value={nama}
										onChangeText={setNama}
									/>
								</View>

								<View style={styles.inputGroup}>
									<Text style={styles.label}>Satuan</Text>
									<DropdownComponent
										data={dataSatuan}
										placeholder={"Pilih Satuan"}
										value={satuan}
										onChange={(val) => setSatuan(val)}
									/>
								</View>

								<View style={styles.inputGroup}>
									<Text style={styles.labelMinStok}>Batas Minimum Stok</Text>
									<View style={styles.minStokContainer}>
										<Ionicons name="alert-circle" size={22} color={COLORS.primary} style={styles.iconInfo} />
										<TextInput
											style={styles.inputMinStok}
											keyboardType="numeric"
											value={minStok}
											onChangeText={setMinStok}
											placeholder='0'
											placeholderTextColor='#999'
										/>
									</View>
								</View>
							</View>
						</View>

						{/* Tombol Simpan yang Lebarnya Terkontrol */}
						<View style={styles.buttonContainer}>
							<TouchableOpacity style={styles.btnSimpan} onPress={handleSimpan}>
								<Text style={styles.btnSimpanText}>SIMPAN</Text>
							</TouchableOpacity>
						</View>

					</View>
				</ScrollView>
			</TouchableWithoutFeedback>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	scrollContainer: {
		flexGrow: 1,
		paddingVertical: isTablet ? 40 : 20,
		alignItems: 'center', // Penting untuk tablet agar form di tengah
	},
	responsiveWrapper: {
		width: '100%',
		maxWidth: isTablet ? 900 : '100%', // Batasi lebar di tablet agar tidak kepanjangan
		paddingHorizontal: 20,
	},
	formContainer: {
		flexDirection: isTablet ? 'row' : 'column', // Tablet: Sampingan, HP: Atas-Bawah
		alignItems: isTablet ? 'flex-start' : 'stretch',
		gap: isTablet ? 40 : 10,
	},
	inputGroup: {
		position: 'relative',
		marginBottom: 30,
	},
	label: {
		position: 'absolute',
		top: -12,
		left: 12,
		backgroundColor: COLORS.primaryLight, // Harus sama dengan background scrollContainer
		color: COLORS.secondary,
		paddingHorizontal: 4,
		fontWeight: 'bold',
		fontSize: 14,
		zIndex: 1,
	},
	labelMinStok: {
		fontWeight: 'bold',
		fontSize: 15,
		color: COLORS.textDark,
		marginBottom: 8,
		marginLeft: 7,
	},
	input: {
		borderWidth: 1.5,
		borderColor: COLORS.border,
		backgroundColor: COLORS.white,
		borderRadius: 12,
		paddingHorizontal: 15,
		height: 55,
		fontSize: 16,
		color: COLORS.textDark,
	},
	minStokContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 1.5,
		borderColor: COLORS.border,
		backgroundColor: COLORS.white,
		borderRadius: 15,
		width: isTablet ? 150 : 120,
		height: 50,
		paddingHorizontal: 12,
	},
	iconInfo: {
		marginRight: 8,
	},
	inputMinStok: {
		fontSize: 18,
		flex: 1,
		fontWeight: 'bold',
		color: COLORS.textDark,
	},
	buttonContainer: {
		alignItems: isTablet ? 'flex-end' : 'center', // Di tablet tombol ke kanan
		marginTop: 30,
		width: '100%',
	},
	btnSimpan: {
		backgroundColor: COLORS.primary,
		borderRadius: 15,
		height: 60,
		width: isTablet ? 200 : '100%', // Di HP full width, di tablet fix width
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		elevation: 5,
		shadowColor: COLORS.primary,
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 6,
	},
	btnSimpanText: {
		color: COLORS.white,
		fontWeight: '800',
		fontSize: 16,
		letterSpacing: 1.5,
	},
	formLeft: {
		flex: isTablet ? 1 : 0,
		width: '100%',
		marginBottom: isTablet ? 0 : 25,
	},
	formRight: {
		flex: isTablet ? 1.5 : 0,
		width: '100%',
	},
	uploadBox: {
		width: '100%',
		aspectRatio: isTablet ? 4 / 3 : 1,
		backgroundColor: COLORS.white,
		borderRadius: 20,
		borderWidth: 2,
		borderColor: COLORS.border,
		borderStyle: 'dashed',
		overflow: 'hidden',
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 10,
	},
	previewContainer: {
		width: '100%',
		height: '100%',
	},
	previewImage: {
		width: '100%',
		height: '100%',
	},
	placeholderContainer: {
		alignItems: 'center',
		justifyContent: 'center',
		padding: 10,
	},
	uploadText: {
		marginTop: 12,
		fontSize: isTablet ? 18 : 14,
		color: COLORS.primary,
		fontWeight: 'bold',
		textAlign: 'center',
	},
	changeBadge: {
		position: 'absolute',
		bottom: 10,
		right: 10,
		backgroundColor: 'rgba(6, 78, 59, 0.8)', // Emerald sangat gelap transparan
		flexDirection: 'row',
		paddingVertical: 6,
		paddingHorizontal: 12,
		borderRadius: 12,
		alignItems: 'center',
	},
	changeText: {
		color: 'white',
		fontSize: 11,
		marginLeft: 5,
		fontWeight: 'bold',
	},
});

// const styles = StyleSheet.create({
// 	scrollContainer: {
// 		flexGrow: 1,
// 		backgroundColor: '#F3F6FA',
// 		alignItems: 'center',
// 		paddingVertical: 20,
// 	},
// 	formContainer: {
// 		display: 'flex',
// 		flexDirection: 'row',
// 		paddingHorizontal: 20,
// 		gap: 30
// 	},
// 	inputGroup: {
// 		position: 'relative',
// 		marginBottom: 30,
// 	},
// 	label: {
// 		position: 'absolute',
// 		top: -12,
// 		left: 12,
// 		backgroundColor: '#F3F6FA',
// 		fontWeight: 'bold',
// 		fontSize: 16,
// 		zIndex: 1
// 	},
// 	labelMinStok: {
// 		fontWeight: 'bold',
// 		fontSize: 16,
// 		marginBottom: 8,
// 		marginLeft: 7
// 	},
// 	input: {
// 		borderWidth: 1,
// 		borderColor: '#ccc',
// 		borderRadius: 12,
// 		paddingHorizontal: 15,
// 		height: 50,
// 		fontSize: 16,
// 	},
// 	dropdown: {
// 		flexDirection: 'row',
// 		justifyContent: 'space-between',
// 		alignItems: 'center',
// 		borderWidth: 1,
// 		borderColor: '#ccc',
// 		borderRadius: 12,
// 		paddingHorizontal: 15,
// 		height: 50,
// 	},
// 	dropdownText: {
// 		color: '#999',
// 		fontSize: 16,
// 	},
// 	minStokContainer: {
// 		flexDirection: 'row',
// 		alignItems: 'center',
// 		borderWidth: 1,
// 		borderColor: '#ccc',
// 		borderRadius: 15, // Membuat lonjong seperti di gambar
// 		width: 80,
// 		height: 50,
// 		paddingHorizontal: 10,
// 	},
// 	iconInfo: {
// 		marginRight: 10,
// 	},
// 	inputMinStok: {
// 		fontSize: 18,
// 		flex: 1,
// 		textAlign: 'center',
// 	},
// 	btnSimpan: {
// 		backgroundColor: '#00695C',
// 		borderRadius: 12,
// 		height: 45,
// 		width: 120,
// 		marginRight: 20,
// 		justifyContent: 'center',
// 		alignItems: 'center',
// 		marginTop: 30,
// 		// Agar tombol tidak terlalu lebar di tablet
// 		alignSelf: isTablet ? 'flex-end' : 'stretch',
// 		// paddingHorizontal: isTablet ? 40 : 0,
// 	},
// 	btnBatal: {
// 		backgroundColor: '#BDC3C7',
// 		borderRadius: 12,
// 		height: 55,
// 		justifyContent: 'center',
// 		alignItems: 'center',
// 		marginTop: 10,
// 		// Agar tombol tidak terlalu lebar di tablet
// 		alignSelf: isTablet ? 'flex-end' : 'stretch',
// 		paddingHorizontal: isTablet ? 40 : 0,
// 	},
// 	btnSimpanText: {
// 		color: '#fff',
// 		fontWeight: 'bold',
// 		fontSize: 16,
// 		letterSpacing: 1,
// 	},
// 	btnBatalText: {
// 		color: '#3c3c3c',
// 		fontWeight: 'bold',
// 		fontSize: 16,
// 		letterSpacing: 1,
// 	},
// 	formLeft: {
// 		flex: .7,
// 	},
// 	formRight: {
// 		flex: 1,
// 		marginTop: 18
// 	},
// 	uploadBox: {
// 		width: '100%',
// 		// Aspect ratio 4:3 agar konsisten di semua layar
// 		aspectRatio: isTablet ? 16 / 9 : 4 / 3,
// 		backgroundColor: '#F2F2F2',
// 		borderRadius: 15,
// 		borderWidth: 1,
// 		borderColor: '#DDD',
// 		borderStyle: 'dashed', // Memberi kesan "area upload"
// 		overflow: 'hidden', // Penting agar gambar tidak keluar dari border radius
// 		justifyContent: 'center',
// 		alignItems: 'center',
// 		marginTop: 10,
// 	},
// 	previewContainer: {
// 		width: '100%',
// 		height: '100%',
// 	},
// 	previewImage: {
// 		width: '100%',
// 		height: '100%',
// 	},
// 	placeholderContainer: {
// 		alignItems: 'center',
// 		justifyContent: 'center',
// 	},
// 	uploadText: {
// 		marginTop: 10,
// 		fontSize: isTablet ? 18 : 14,
// 		color: '#888',
// 		fontWeight: '500',
// 	},
// 	changeBadge: {
// 		position: 'absolute',
// 		bottom: 12,
// 		right: 12,
// 		backgroundColor: 'rgba(0,0,0,0.6)', // Semi transparan hitam
// 		flexDirection: 'row',
// 		paddingVertical: 6,
// 		paddingHorizontal: 12,
// 		borderRadius: 20,
// 		alignItems: 'center',
// 	},
// 	changeText: {
// 		color: 'white',
// 		fontSize: 12,
// 		marginLeft: 5,
// 		fontWeight: 'bold',
// 	},
// });