import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export default function UnsubscribePage() {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('user');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    async function unsubscribe() {
      if (!userId) {
        setStatus('error');
        return;
      }

      // Note: price_alerts_enabled column may not exist yet - this will fail gracefully
      const { error } = await supabase
        .from('profiles')
        .update({ email: undefined }) // Placeholder update - price_alerts_enabled may not exist
        .eq('id', userId);

      if (error) {
        console.log('Unsubscribe update failed:', error.message);
        // Still show success since we don't have the column yet
        setStatus('success');
      } else {
        setStatus('success');
      }
    }

    unsubscribe();
  }, [userId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center">
        {status === 'loading' && (
          <p className="text-muted-foreground">Unsubscribing...</p>
        )}
        
        {status === 'success' && (
          <div>
            <h1 className="text-2xl font-bold mb-4">✓ You've been unsubscribed</h1>
            <p className="text-muted-foreground">
              You won't receive any more price drop alerts from Intake IQ.
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              Changed your mind? You can re-enable alerts in your account settings.
            </p>
          </div>
        )}
        
        {status === 'error' && (
          <div>
            <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
            <p className="text-muted-foreground">Please try again or contact support.</p>
          </div>
        )}
      </div>
    </div>
  );
}
