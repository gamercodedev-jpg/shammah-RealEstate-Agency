import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { subscribeUser } from '@/utils/pushManager';

export default function NotificationSettings() {
  const [loading, setLoading] = useState(false);

  const handleEnable = async () => {
    setLoading(true);
    try {
      const result = await subscribeUser();
      if (result.success) {
        toast({ title: 'Notifications enabled', description: 'You will receive push notifications.' });
      } else {
        toast({ title: 'Failed', description: result.message || 'Could not subscribe to notifications.', variant: 'destructive' });
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message || 'Unexpected error', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button onClick={handleEnable} disabled={loading}>
        {loading ? 'Enabling...' : 'Turn on Notifications'}
      </Button>
    </div>
  );
}
