/**
 * AdTile - Native ad component styled to match ProductCardWithSizes
 * 
 * This component renders Google AdSense native ads that blend with your product tiles.
 * Place every 12 tiles for optimal monetization without disrupting UX.
 */

import { useEffect, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";

interface AdTileProps {
  adSlot: string; // Your AdSense ad slot ID
  adFormat?: 'fluid' | 'auto';
  className?: string;
}

export function AdTile({ adSlot, adFormat = 'fluid', className = '' }: AdTileProps) {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Push ad to AdSense queue after component mounts
    try {
      if (window.adsbygoogle && adRef.current) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, []);

  return (
    <Card 
      className={`h-[420px] sm:h-[460px] md:h-[500px] border-border/50 flex flex-col relative overflow-hidden rounded-lg ${className}`}
      style={{ 
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)'
      }}
    >
      <CardContent className="p-2 sm:p-2.5 md:p-3 flex flex-col flex-1 overflow-hidden">
        {/* Sponsored Label */}
        <div className="flex items-center justify-center mb-2">
          <span className="text-[8px] sm:text-[9px] uppercase tracking-widest text-muted-foreground/60 font-medium px-2 py-1 bg-muted/20 rounded-full">
            Sponsored
          </span>
        </div>

        {/* Ad Container */}
        <div 
          ref={adRef}
          className="flex-1 flex items-center justify-center"
        >
          <ins
            className="adsbygoogle"
            style={{ 
              display: 'block',
              width: '100%',
              height: '100%',
              minHeight: '250px'
            }}
            data-ad-client="ca-pub-intakeapp26-21" // Replace with your AdSense publisher ID
            data-ad-slot={adSlot}
            data-ad-format={adFormat}
            data-full-width-responsive="true"
          />
        </div>
      </CardContent>
    </Card>
  );
}

// Declare adsbygoogle for TypeScript
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}
