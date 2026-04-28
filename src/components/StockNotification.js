import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';

const jedaWaktu = 30 * 60 * 1000; // 30 menit

// Konfigurasi handler notifikasi
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Minta izin notifikasi
export async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) {
    alert('Notifikasi hanya berjalan di perangkat fisik');
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    alert('Izin notifikasi ditolak!');
    return;
  }
}

// Kirim notifikasi lokal saat stok minimum
export async function sendLowStockNotification(minimumItems) {
  try {
    const lastNotified = await AsyncStorage.getItem("last_notif");
    const nowTime = Date.now();

    if (lastNotified !== null) {
      const selisih = nowTime - parseInt(lastNotified);
      if (selisih < jedaWaktu) { return }
    }

    if (minimumItems.length > 0) {
      await Notifications.scheduleNotificationAsync({
        identifier: "notifikasi_stok_kritis",
        content: {
          title: "Peringatan stok minimum",
          body: `Ada ${minimumItems.length} bahan yang mencapai minimum, lakukan restock segera`,
          data: {
            screen: 'stokBarangHabis'
          }
        },
        trigger: null
      });

      await AsyncStorage.setItem("last_notif", Date.now().toString());
    }
  } catch (e) {
    console.log("error ", e);
  }
}