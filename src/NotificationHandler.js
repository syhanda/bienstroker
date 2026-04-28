import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { navigate } from './NavigationRef';

export default function NotificationHandler() {
    useEffect(() => {
        // 1. Handle app dibuka dari kondisi mati
        Notifications.getLastNotificationResponseAsync()
            .then(response => {
                if (response) {
                    const data = response.notification.request.content.data;

                    if (data?.screen) {
                        navigate(data.screen);
                    }
                }
            });

        // 2. Handle klik notifikasi saat app sudah jalan
        const sub = Notifications.addNotificationResponseReceivedListener(response => {
            const data = response.notification.request.content.data;

            if (data?.screen) {
                navigate(data.screen);
            }
        });

        return () => sub.remove();
    }, []);

    return null;
}