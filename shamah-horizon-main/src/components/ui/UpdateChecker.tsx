import * as React from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

export function UpdateChecker() {
  const [checking, setChecking] = React.useState(false);

  const check = async () => {
    if (!('serviceWorker' in navigator)) {
      toast({ title: 'Not available', description: 'Service Worker not supported in this browser.' });
      return;
    }

    setChecking(true);
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      if (!reg) {
        toast({ title: 'No Service Worker', description: 'No service worker is registered.' });
        return;
      }

      await reg.update();
      toast({ title: 'Check complete', description: 'Service worker update checked.' });
    } catch (err: any) {
      toast({ title: 'Update check failed', description: String(err), variant: 'destructive' });
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-4 z-50">
      <Button onClick={check} disabled={checking}>
        {checking ? 'Checking...' : 'Check for updates'}
      </Button>
    </div>
  );
}
