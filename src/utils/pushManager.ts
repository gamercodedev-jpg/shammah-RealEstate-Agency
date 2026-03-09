import { API_BASE_URL } from "@/lib/api";

// VAPID public key provided by the user
const VAPID_PUBLIC_KEY = "BHumbw1t_9AloftLkAvIUPlQj3w4pZkXIVOgqBvtxd8PAoXlKOTOI1u4pm47W07O_22fZXjy791aX9njY1T4DM4";

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function subscribeUser(): Promise<{ success: boolean; message?: string }> {
  if (typeof window === 'undefined') return { success: false, message: 'Not in a browser' };
  if (!('serviceWorker' in navigator)) return { success: false, message: 'Service workers are not supported in this browser' };
  if (!('PushManager' in window)) return { success: false, message: 'Push API not supported in this browser' };

  try {
    // Register the service worker (public/sw.js will be copied to dist root)
    const registration = await navigator.serviceWorker.register('/sw.js');

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    // Send subscription to backend to store
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
}
