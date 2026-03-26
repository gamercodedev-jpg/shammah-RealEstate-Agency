import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

type Options = {
  redirectTo?: string;
  clearKeys?: string[]; // localStorage keys to clear
  onExit?: () => void;
};

export function useQuickExit(opts?: Options) {
  const navigate = useNavigate();
  const lastEsc = useRef<number | null>(null);
  const redirectTo = opts?.redirectTo ?? 'https://www.google.com';

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        const now = Date.now();
        if (lastEsc.current && now - lastEsc.current < 600) {
          doExit();
        } else {
          lastEsc.current = now;
          setTimeout(() => { lastEsc.current = null; }, 700);
        }
      }
    }

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  function doExit() {
    try {
      // Clear sensitive local storage keys
      if (opts?.clearKeys) {
        for (const k of opts.clearKeys) localStorage.removeItem(k);
      } else {
        // Conservative default: remove common session keys
        localStorage.removeItem('safereport-session');
        localStorage.removeItem('safereport-incognito');
        localStorage.removeItem('reportQueue');
      }
      // optional callback
      opts?.onExit?.();
    } catch (e) {
      // ignore
    }

    // Attempt full redirect to reduce traces in browser UI
    window.location.href = redirectTo;
  }

  // Expose a programmatic exit (e.g., hidden button)
  return { quickExit: doExit };
}

export default useQuickExit;
