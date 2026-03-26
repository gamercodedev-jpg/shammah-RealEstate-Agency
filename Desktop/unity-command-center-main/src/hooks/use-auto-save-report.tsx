import { useEffect, useRef, useState } from 'react';

export function useAutoSaveReport(key = 'safereport-draft', intervalMs = 5000) {
  const [restored, setRestored] = useState<any | null>(null);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        setRestored(JSON.parse(raw));
      }
    } catch (e) {
      // ignore
    }
  }, [key]);

  function startAutoSave(getState: () => any) {
    stopAutoSave();
    timer.current = window.setInterval(() => {
      try {
        const state = getState();
        localStorage.setItem(key, JSON.stringify(state));
      } catch (e) {
        // ignore
      }
    }, intervalMs);
  }

  function stopAutoSave() {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
  }

  function clearSaved() {
    try { localStorage.removeItem(key); } catch (e) {}
  }

  return { restored, startAutoSave, stopAutoSave, clearSaved };
}

export default useAutoSaveReport;
