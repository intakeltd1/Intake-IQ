// app/unsubscribe/page.tsx (or pages/unsubscribe.tsx)
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function UnsubscribePage() {
  const searchParams = useSearchParams();
  const userId = searchParams.get('user');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    async function unsubscribe() {
      if (!userId) {
        setStatus('error');
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({ price_alerts_enabled: false })
        .eq('id', userId);

      if (error) {
        setStatus('error');
      } else {
        setStatus('success');
      }
    }

    unsubscribe();
  }, [userId]);

  return (
    <div style={{ maxWidth: '600px', margin: '100px auto', textAlign: 'center', padding: '20px' }}>
      {status === 'loading' && <p>Unsubscribing...</p>}
      
      {status === 'success' && (
        <div>
          <h1>✓ You've been unsubscribed</h1>
          <p>You won't receive any more price drop alerts from Intake IQ.</p>
          <p style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
            Changed your mind? You can re-enable alerts in your account settings.
          </p>
        </div>
      )}
      
      {status === 'error' && (
        <div>
          <h1>Something went wrong</h1>
          <p>Please try again or contact support.</p>
        </div>
      )}
    </div>
  );
}
