import { useCallback } from 'react';
import { API_BASE_URL } from '@/lib/api';

const VAPID_PUBLIC_KEY = 'BHumbw1t_9AloftLkAvIUPlQj3w4pZkXIVOgqBvtxd8PAoXlKOTOI1u4pm47W07O_22fZXjy791aX9njY1T4DM4';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

export function usePushNotifications() {
  const isSupported = typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

  const isPermissionGranted = () => Notification.permission === 'granted';

  const subscribe = useCallback(async (): Promise<{ success: boolean; message?: string }> => {
    if (!isSupported) return { success: false, message: 'Push not supported' };

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return { success: false, message: 'Permission denied' };

      const registration = await navigator.serviceWorker.register('/sw.js');

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      const res = await fetch(`${API_BASE_URL}/api/notifications/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription }),
        cache: 'no-store',
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        return { success: false, message: `Server responded: ${res.status} ${txt}` };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, message: err?.message || String(err) };
    }
  }, []);

  return {
    isSupported,
    isPermissionGranted,
    subscribe,
  };
}
