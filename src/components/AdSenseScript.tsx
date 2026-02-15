/**
 * AdSenseScript - Loads Google AdSense script
 * 
 * Add this component to your root layout or _app.tsx
 */

import Script from 'next/script';

interface AdSenseScriptProps {
  publisherId: string; // Your AdSense publisher ID (ca-pub-XXXXXXXXXX)
}

export function AdSenseScript({ publisherId }: AdSenseScriptProps) {
  return (
    <>
      {/* AdSense Script */}
      <Script
        id="adsense-script"
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`}
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />

      {/* Optional: Auto ads (shows ads automatically across your site) */}
      <Script
        id="adsense-auto-ads"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (adsbygoogle = window.adsbygoogle || []).push({
              google_ad_client: "${publisherId}",
              enable_page_level_ads: true
            });
          `,
        }}
      />
    </>
  );
}
