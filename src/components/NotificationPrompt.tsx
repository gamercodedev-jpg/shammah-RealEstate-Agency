import { useEffect, useState } from "react";
import { subscribeUser } from "@/utils/pushManager";

const STORAGE_KEY = "notify_prompt_shown_v1";

export default function NotificationPrompt() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const already = localStorage.getItem(STORAGE_KEY);
      const force = new URLSearchParams(window.location.search).get("show_notify_prompt") === "1";
      const perm = (window as any).Notification?.permission;
      console.log("NotificationPrompt: permission=", perm, "already=", already, "force=", force);
      if (already && !force) return;
      if ("Notification" in window) {
        // Show prompt on first visit unless the user already granted notifications.
        // If permission is 'granted' there's no need to prompt; otherwise show (covers 'default' and 'denied').
        if (force || perm !== "granted") {
          setVisible(true);
        }
      }
    } catch (e) {
      // ignore
    }
  }, []);

  if (!visible) return null;

  const onAllow = async () => {
    try {
      const perm = await Notification.requestPermission();
      if (perm === "granted") {
        // try to subscribe the user (fire-and-forget)
        subscribeUser().catch(() => {});
      }
    } catch (e) {
      // ignore
    } finally {
      try {
        localStorage.setItem(STORAGE_KEY, "1");
      } catch (e) {}
      setVisible(false);
    }
  };

  const onDismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch (e) {}
    setVisible(false);
  };

  return (
    <div className="fixed left-1/2 bottom-6 z-50 w-[min(980px,92%)] -translate-x-1/2 rounded-lg bg-white/95 p-4 shadow-lg ring-1 ring-slate-900/5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="text-sm font-medium">Enable notifications</div>
          <div className="text-sm text-slate-600">Get notified when new properties are listed.</div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onDismiss}
            className="rounded-md bg-transparent px-3 py-1 text-sm text-slate-700 hover:bg-slate-100"
          >
            No thanks
          </button>
          <button
            onClick={onAllow}
            className="rounded-md bg-sky-600 px-3 py-1 text-sm font-medium text-white hover:bg-sky-700"
          >
            Allow notifications
          </button>
        </div>
      </div>
    </div>
  );
}
