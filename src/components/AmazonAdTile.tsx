/**
 * AmazonAdTile - Native shopping ads showing actual protein products
 * 
 * This component displays Amazon products directly in your grid.
 * Better conversion rates since users can buy immediately!
 */

import { useEffect, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";

interface AmazonAdTileProps {
  /**
   * Amazon Associate Tracking ID
   * Format: yoursite-20
   */
  trackingId: string;
  
  /**
   * Amazon product ASINs to display
   * You can specify multiple ASINs for rotation
   * Example: ["B00QQA0Z3W", "B002DYJ0SG"]
   */
  asins?: string[];
  
  /**
   * Ad region (defaults to UK for your audience)
   */
  region?: 'uk' | 'us' | 'de' | 'fr';
  
  className?: string;
}

export function AmazonAdTile({ 
  trackingId, 
  asins = [], 
  region = 'uk',
  className = '' 
}: AmazonAdTileProps) {
  const adRef = useRef<HTMLDivElement>(null);

  // Popular UK protein products ASINs (examples)
  const defaultAsins = [
    'B00QQA0Z3W', // Optimum Nutrition Gold Standard Whey
    'B002DYJ0SG', // Myprotein Impact Whey
    'B08C7GD1DJ', // Bulk Powders Pure Whey
    'B07GXQKP3Q', // PhD Nutrition Diet Whey
  ];

  const productAsins = asins.length > 0 ? asins : defaultAsins;

  useEffect(() => {
    // Load Amazon Native Shopping Ads script
    const script = document.createElement('script');
    script.src = '//z-na.amazon-adsystem.com/widgets/onejs?MarketPlace=GB';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const marketplaceMapping = {
    uk: 'GB',
    us: 'US',
    de: 'DE',
    fr: 'FR',
  };

  return (
    <Card 
      className={`h-[420px] sm:h-[460px] md:h-[500px] border-border/50 flex flex-col relative overflow-hidden rounded-lg ${className}`}
      style={{ 
        background: 'linear-gradient(135deg, rgba(255, 153, 0, 0.05) 0%, rgba(255, 193, 7, 0.05) 100%)'
      }}
    >
      <CardContent className="p-2 sm:p-2.5 md:p-3 flex flex-col flex-1 overflow-hidden">
        {/* Sponsored Label */}
        <div className="flex items-center justify-center mb-2">
          <span className="text-[8px] sm:text-[9px] uppercase tracking-widest text-muted-foreground/60 font-medium px-2 py-1 bg-muted/20 rounded-full">
            Recommended Product
          </span>
        </div>

        {/* Amazon Ad Container */}
        <div 
          ref={adRef}
          className="flex-1 flex items-center justify-center overflow-hidden"
        >
          <div 
            id="amzn-assoc-ad-container"
            style={{ width: '100%', height: '100%' }}
          >
            <iframe 
              src={`//ws-eu.amazon-adsystem.com/widgets/q?ServiceVersion=20070822&OneJS=1&Operation=GetAdHtml&MarketPlace=${marketplaceMapping[region]}&source=ac&ref=tf_til&ad_type=product_link&tracking_id=${trackingId}&marketplace=amazon&region=${marketplaceMapping[region]}&placement=${productAsins[0]}&asins=${productAsins.join(',')}&show_border=false&link_opens_in_new_window=true&price_color=333333&title_color=0066c0&bg_color=ffffff`}
              width="100%" 
              height="100%" 
              scrolling="no" 
              frameBorder="0"
              style={{ border: 'none' }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Usage Example:
 * 
 * <AmazonAdTile 
 *   trackingId="intakeapp-21"
 *   asins={['B00QQA0Z3W', 'B002DYJ0SG']}
 *   region="uk"
 * />
 */
