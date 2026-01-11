// Awin Affiliate Link Handler
// Converts product URLs to Awin affiliate links

// Your Awin Publisher ID (from the mastertag)
const AWIN_PUBLISHER_ID = '2578637';

// Awin Merchant IDs for each retailer
// You need to get these from your Awin dashboard for each program you've joined
const AWIN_MERCHANT_IDS: { [key: string]: string } = {
  'grenade.com': '25079',
  'optimumnutrition.com': '19863',
  'grenade.com': '25079',

};

/**
 * Extracts domain from URL
 */
function getDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

/**
 * Checks if a URL should be converted to an Awin affiliate link
 */
function shouldConvertToAwin(url: string): boolean {
  const domain = getDomain(url);
  return domain in AWIN_MERCHANT_IDS;
}

/**
 * Converts a product URL to an Awin affiliate link
 * 
 * @param originalUrl - The product URL from your data
 * @returns Awin affiliate link or original URL if not eligible
 */
export function getAffiliateUrl(originalUrl: string | undefined): string {
  if (!originalUrl) return '#';
  
  // Check if this is an Awin-eligible retailer
  if (!shouldConvertToAwin(originalUrl)) {
    return originalUrl; // Return original URL for non-Awin retailers
  }
  
  const domain = getDomain(originalUrl);
  const merchantId = AWIN_MERCHANT_IDS[domain];
  
  // Build Awin redirect URL
  const awinUrl = new URL('https://www.awin1.com/cread.php');
  awinUrl.searchParams.set('awinmid', merchantId);
  awinUrl.searchParams.set('awinaffid', AWIN_PUBLISHER_ID);
  awinUrl.searchParams.set('ued', originalUrl);
  awinUrl.searchParams.set('p', ''); // Optional: can add custom tracking parameters
  
  return awinUrl.toString();
}

/**
 * Get merchant ID for a given domain (for debugging)
 */
export function getMerchantId(url: string): string | null {
  const domain = getDomain(url);
  return AWIN_MERCHANT_IDS[domain] || null;
}

/**
 * Check if Awin MasterTag is loaded
 */
export function isAwinLoaded(): boolean {
  return typeof (window as any).AWIN !== 'undefined';
}

/**
 * Log affiliate click for debugging
 */
export function logAffiliateClick(url: string, isAwin: boolean) {
  if (process.env.NODE_ENV === 'development') {
    console.log('Affiliate Click:', {
      originalUrl: url,
      isAwinLink: isAwin,
      merchantId: getMerchantId(url),
      mastertag: isAwinLoaded() ? 'Loaded' : 'Not Loaded'
    });
  }
}

/**
 * Add click tracking attributes for Awin
 * Use this on anchor tags: <a {...getAwinAttributes(url)}>
 */
export function getAwinAttributes(url: string) {
  if (!shouldConvertToAwin(url)) {
    return {};
  }
  
  const domain = getDomain(url);
  const merchantId = AWIN_MERCHANT_IDS[domain];
  
  return {
    'data-awin-merchant': merchantId,
    'data-awin-publisher': AWIN_PUBLISHER_ID,
    'rel': 'nofollow sponsored', // SEO best practice for affiliate links
  };
}
