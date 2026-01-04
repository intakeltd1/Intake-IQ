import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ImageIcon, Crown, Zap, Droplets, Plus, Check, Heart } from "lucide-react";
import { useState, useRef } from "react";
import { 
  ElectrolyteProduct, 
  getActivePrice,
  calculateElectrolyteValueRating,
  getElectrolyteValueRatingColor,
  ElectrolyteBenchmarks,
  ElectrolyteRankings
} from "@/utils/electrolyteValueRating";
import { GroupedElectrolyteProduct } from "@/utils/electrolyteProductUtils";
import { useElectrolyteComparison, getProductKey } from "@/hooks/useElectrolyteComparison";
import { toTitleCase, formatBrand as formatBrandName, formatFlavour } from "@/utils/textFormatting";
import { useAuth } from "@/hooks/useAuth";
import { useFavorites } from "@/hooks/useFavorites";
import { usePriceTrend } from "@/hooks/usePriceTrend";
import { PriceTrendIcon } from "@/components/PriceTrendIcon";
import { LoginPromptDialog } from "@/components/LoginPromptDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ElectrolyteProductCardProps {
  product: ElectrolyteProduct | GroupedElectrolyteProduct;
  isSubscription: boolean;
  benchmarks: ElectrolyteBenchmarks | null;
  rankings: ElectrolyteRankings | null;
  isTopValue?: boolean;
  isTopValueOfDay?: boolean;
}

// Type guard to check if product has variants
const hasVariants = (product: ElectrolyteProduct | GroupedElectrolyteProduct): product is GroupedElectrolyteProduct => {
  return 'variants' in product && Array.isArray(product.variants) && product.variants.length > 1;
};

// Brand extraction helper
const extractBrandFromUrl = (url?: string): string | undefined => {
  if (!url) return undefined;
  try {
    const u = new URL(url);
    let host = u.hostname.toLowerCase().replace(/^www\./, '');
    const parts = host.split('.');
    let base = parts[0];
    if (parts.length >= 3 && parts[parts.length - 2] === 'co') {
      base = parts[parts.length - 3];
    }
    return base.replace(/[-_]/g, ' ');
  } catch {
    return undefined;
  }
};

const getBrandFromProduct = (product: ElectrolyteProduct): string => {
  const candidate = (product.COMPANY || '').trim();
  const generic = new Set(['see website', 'see site', 'website', 'visit site', 'n/a', 'unknown']);
  if (candidate && !generic.has(candidate.toLowerCase())) {
    return formatBrandName(candidate);
  }
  const extracted = extractBrandFromUrl(product.PAGE_URL || product.IMAGE_URL);
  return formatBrandName(extracted) || formatBrandName(candidate) || 'Unknown';
};

const safeDisplayValue = (value: any, fallback: string = 'N/A'): string => {
  if (value === undefined || value === null || value === 'nan' || 
      value === 'undefined' || String(value).toLowerCase() === 'nan' || 
      String(value).trim() === '') {
    return fallback;
  }
  return String(value);
};

export function ElectrolyteProductCard({ 
  product, 
  isSubscription,
  benchmarks,
  rankings,
  isTopValue,
  isTopValueOfDay
}: ElectrolyteProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const [addAnimation, setAddAnimation] = useState(false);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);
  
  // Handle variants
  const productHasVariants = hasVariants(product);
  const currentProduct = productHasVariants ? product.variants[selectedVariantIndex] : product;
  const variantCount = productHasVariants ? product.variantCount : 1;
  const productUrl = currentProduct.PAGE_URL;
  
  const { addToComparison, isInComparison, comparisonProducts } = useElectrolyteComparison();
  const isCompared = isInComparison(currentProduct);
  
  // Auth & Favorites
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const isProductFavorited = productUrl ? isFavorite(productUrl) : false;
  
  // Price trend
  const priceTrend = usePriceTrend(productUrl);
  
  const activePrice = getActivePrice(currentProduct, isSubscription);
  const outOfStock = currentProduct.IN_STOCK === false;
  
  const valueRating = benchmarks && rankings
    ? calculateElectrolyteValueRating(currentProduct, benchmarks, rankings, isSubscription)
    : null;

  const handleAddToComparison = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!isCompared && comparisonProducts.length < 4) {
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        const clone = cardRef.current.cloneNode(true) as HTMLElement;
        
        clone.style.position = 'fixed';
        clone.style.top = `${rect.top}px`;
        clone.style.left = `${rect.left}px`;
        clone.style.width = `${rect.width}px`;
        clone.style.height = `${rect.height}px`;
        clone.style.zIndex = '9999';
        clone.style.pointerEvents = 'none';
        clone.style.transition = 'none';
        
        document.body.appendChild(clone);
        
        const targetX = window.innerWidth - rect.left - rect.width / 2 - 80;
        const targetY = window.innerHeight - rect.top - rect.height / 2 - 80;
        
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            clone.style.transition = 'all 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)';
            clone.style.transform = `translate(${targetX}px, ${targetY}px) scale(0.2) rotate(3deg)`;
            clone.style.opacity = '0';
          });
        });
        
        setTimeout(() => {
          if (document.body.contains(clone)) {
            document.body.removeChild(clone);
          }
          addToComparison(currentProduct);
        }, 500);
      } else {
        addToComparison(currentProduct);
      }
      
      setAddAnimation(true);
      setTimeout(() => setAddAnimation(false), 500);
    }
  };

  const handleVariantChange = (value: string) => {
    const index = parseInt(value, 10);
    if (!isNaN(index)) {
      setSelectedVariantIndex(index);
      setImageError(false);
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    
    // Convert electrolyte product to favorites format
    toggleFavorite({
      URL: productUrl,
      LINK: productUrl,
      TITLE: currentProduct.TITLE,
      IMAGE_URL: currentProduct.IMAGE_URL,
    });
  };

  const getBorderClass = () => {
    if (outOfStock) return 'border-border/20';
    if (isTopValueOfDay) return 'border-2 border-amber-400';
    if (isTopValue) return 'border border-primary/50';
    return 'border-border';
  };

  // Calculate total electrolytes
  const totalElectrolytes = (currentProduct.SODIUM_MG ?? 0) + (currentProduct.POTASSIUM_MG ?? 0) + (currentProduct.MAGNESIUM_MG ?? 0);

  // Format price display
  const formatPrice = (price: number | null) => {
    if (!price) return 'N/A';
    return `£${price.toFixed(2)}`;
  };

  // Format RRP with discount
  const rrpNum = typeof currentProduct.RRP_NUM === 'number' ? currentProduct.RRP_NUM : null;
  const discountPercent = activePrice && rrpNum && rrpNum > activePrice
    ? Math.round(((rrpNum - activePrice) / rrpNum) * 100)
    : null;

  return (
    <>
      <Card 
        ref={cardRef}
        className={`h-[495px] sm:h-[545px] md:h-[600px] group ${getBorderClass()} ${
          outOfStock ? 'opacity-60 grayscale' : ''
        } flex flex-col relative overflow-hidden rounded-lg border bg-card`}
      >
        {/* ZONE 1: Product Image - Fixed height */}
        <div className="relative w-full h-[160px] sm:h-[180px] md:h-[200px] overflow-hidden rounded-t-lg bg-white flex-shrink-0">
          {currentProduct.IMAGE_URL && !imageError ? (
            <img
              src={currentProduct.IMAGE_URL}
              alt={currentProduct.TITLE || "Product image"}
              className={`w-full h-full object-cover object-center rounded-t-lg ${
                outOfStock ? 'grayscale' : ''
              }`}
              loading="lazy"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-white rounded-t-lg">
              <ImageIcon className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-muted-foreground" />
            </div>
          )}

          {/* Stock Status Badge */}
          {outOfStock && (
            <Badge variant="destructive" className="absolute bottom-2 left-2 text-[10px] sm:text-xs">
              Out of Stock
            </Badge>
          )}

          {/* Format Badge - TOP LEFT */}
          {currentProduct.FORMAT && (
            <Badge variant="secondary" className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 text-[8px] sm:text-[9px]">
              {currentProduct.FORMAT}
            </Badge>
          )}

          {/* Value Badges - BELOW FORMAT */}
          <div className="absolute top-7 left-1.5 sm:top-8 sm:left-2 flex flex-col gap-1">
            {isTopValueOfDay && !outOfStock && (
              <Badge className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-amber-900 font-bold shadow-xl animate-pulse flex items-center gap-1 border border-amber-300 text-[9px] sm:text-[10px]">
                <Crown className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                Top Value
              </Badge>
            )}
            {isTopValue && !outOfStock && !isTopValueOfDay && (
              <Badge className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-white font-semibold shadow-lg text-[9px] sm:text-[10px]">
                Great Value
              </Badge>
            )}
          </div>

          {/* Right-side icon stack */}
          <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 z-[100] flex flex-col gap-1 sm:gap-1.5">
            {/* Add to comparison button */}
            <Button
              onClick={handleAddToComparison}
              disabled={isCompared || comparisonProducts.length >= 4 || outOfStock}
              size="sm"
              variant="outline"
              className={`h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 p-0 border-2 backdrop-blur-sm rounded-full ${
                addAnimation ? 'scale-0' : ''
              } ${
                isCompared
                  ? 'bg-blue-500 border-blue-500 text-white'
                  : comparisonProducts.length >= 4
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : 'bg-background/80 border-white/60 text-white'
              }`}
            >
              {isCompared ? (
                <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 font-bold" />
              ) : (
                <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 font-bold" />
              )}
            </Button>

            {/* Favorite button */}
            <Button
              onClick={handleFavoriteClick}
              size="sm"
              variant="outline"
              className={`h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 p-0 border-2 backdrop-blur-sm rounded-full ${
                isProductFavorited 
                  ? 'bg-red-500 border-red-500 text-white' 
                  : 'bg-background/80 border-white/60 text-white'
              }`}
            >
              <Heart className={`h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 ${isProductFavorited ? 'fill-current' : ''}`} />
            </Button>

            {/* Price trend indicator */}
            {priceTrend && !outOfStock && (
              <PriceTrendIcon trend={priceTrend} />
            )}
          </div>
        </div>

        {/* ZONE 2 & 3: Content Area - Fixed layout */}
        <CardContent className="p-2 sm:p-2.5 md:p-3 flex flex-col flex-1 overflow-hidden">
          {/* Details Section - Fixed sizing */}
          <div className="flex flex-col gap-1 flex-1 min-h-0">
            {/* Brand Name */}
            <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-muted-foreground font-medium truncate">
              {getBrandFromProduct(currentProduct)}
            </p>

            {/* Product Title */}
            {currentProduct.PAGE_URL ? (
              <a
                href={currentProduct.PAGE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="block no-underline"
                onClick={(e) => e.stopPropagation()}
              >
                <CardTitle
                  className="text-xs sm:text-sm font-heading font-semibold line-clamp-2 leading-tight text-foreground"
                  title={toTitleCase(safeDisplayValue(currentProduct.TITLE, "Product Title Not Available"))}
                >
                  {toTitleCase(safeDisplayValue(currentProduct.TITLE, "Product Title Not Available"))}
                </CardTitle>
              </a>
            ) : (
              <CardTitle
                className="text-xs sm:text-sm font-heading font-semibold line-clamp-2 leading-tight"
                title={toTitleCase(safeDisplayValue(currentProduct.TITLE, "Product Title Not Available"))}
              >
                {toTitleCase(safeDisplayValue(currentProduct.TITLE, "Product Title Not Available"))}
              </CardTitle>
            )}

            {/* Flavour Section - Isolated with high z-index */}
            <div 
              className="relative z-[500] isolate mb-1" 
              onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
              onTouchStart={(e) => e.stopPropagation()}
            >
              {productHasVariants ? (
                <div className="flex items-center justify-between gap-1">
                  <Select
                    value={selectedVariantIndex.toString()}
                    onValueChange={handleVariantChange}
                  >
                    <SelectTrigger 
                      className="min-h-[44px] sm:min-h-[36px] h-auto text-[11px] sm:text-xs px-3 py-2 bg-background border-border w-full touch-manipulation"
                      onClick={(e) => e.stopPropagation()}
                      onTouchStart={(e) => e.stopPropagation()}
                    >
                      <SelectValue placeholder="Select flavour">
                        {formatFlavour(safeDisplayValue(currentProduct.FLAVOUR, 'No flavour'))}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent 
                      className="bg-background border-border z-[9999] max-h-64"
                      position="popper"
                      sideOffset={4}
                    >
                      {(product as GroupedElectrolyteProduct).variants.map((variant, idx) => (
                        <SelectItem 
                          key={idx} 
                          value={idx.toString()}
                          className="text-sm min-h-[44px] py-3 touch-manipulation"
                        >
                          {formatFlavour(safeDisplayValue(variant.FLAVOUR, 'No flavour'))}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-[8px] sm:text-[9px] text-muted-foreground whitespace-nowrap">
                    +{variantCount - 1}
                  </span>
                </div>
              ) : (
                currentProduct.FLAVOUR && currentProduct.FLAVOUR !== 'Flavour' && (
                  <p
                    className="text-[10px] sm:text-[11px] text-muted-foreground line-clamp-1 min-h-[14px]"
                    title={formatFlavour(currentProduct.FLAVOUR)}
                  >
                    {formatFlavour(currentProduct.FLAVOUR)}
                  </p>
                )
              )}
            </div>

            {/* Price and Servings Row */}
            <div className="flex items-center justify-between gap-1 pt-1 border-t border-border/20">
              <div className="flex flex-col">
                {currentProduct.RRP_NUM && discountPercent && discountPercent > 0 && (
                  <span className="text-[8px] sm:text-[9px] text-muted-foreground line-through">
                    was £{currentProduct.RRP_NUM.toFixed(2)}
                  </span>
                )}
                <div className="flex items-center gap-1">
                  <span className="text-sm sm:text-base font-bold text-primary tabular-nums tracking-tight">
                    {formatPrice(activePrice)}
                  </span>
                  {discountPercent && discountPercent > 0 && (
                    <Badge className="bg-green-500/20 text-green-600 text-[8px] px-1 py-0">
                      -{discountPercent}%
                    </Badge>
                  )}
                </div>
              </div>
              <Badge variant="secondary" className="text-[8px] sm:text-[9px] px-1.5 py-0.5 font-medium">
                {currentProduct.SERVINGS || 'N/A'} servings
              </Badge>
            </div>

            {/* Subscription Amount */}
            {isSubscription && currentProduct.SUB_AMOUNT && (
              <div className="flex items-center gap-1 bg-primary/10 border border-primary/20 rounded-md px-2 py-0.5">
                <Zap className="h-2.5 w-2.5 text-primary" />
                <span className="text-[9px] sm:text-[10px] font-semibold text-primary">
                  {currentProduct.SUB_AMOUNT}
                </span>
              </div>
            )}

            {/* Electrolyte Breakdown */}
            <div className="bg-blue-500/5 border border-blue-500/10 rounded-md px-2 py-1.5">
              <div className="flex items-center justify-between mb-0.5">
                <p className="text-[7px] sm:text-[8px] text-muted-foreground font-medium uppercase tracking-wide">
                  Electrolytes per serving
                </p>
                {totalElectrolytes > 0 && (
                  <span className="text-[10px] sm:text-[11px] font-bold text-blue-600 tabular-nums flex items-center gap-0.5">
                    <Droplets className="h-2.5 w-2.5" />
                    {Math.round(totalElectrolytes)}mg
                  </span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-1">
                <div className="text-center">
                  <p className="text-[7px] sm:text-[8px] text-muted-foreground">Na</p>
                  <p className="text-[9px] sm:text-[10px] font-semibold text-foreground tabular-nums">
                    {currentProduct.SODIUM_MG ? `${Math.round(currentProduct.SODIUM_MG)}` : '-'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[7px] sm:text-[8px] text-muted-foreground">K</p>
                  <p className="text-[9px] sm:text-[10px] font-semibold text-foreground tabular-nums">
                    {currentProduct.POTASSIUM_MG ? `${Math.round(currentProduct.POTASSIUM_MG)}` : '-'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[7px] sm:text-[8px] text-muted-foreground">Mg</p>
                  <p className="text-[9px] sm:text-[10px] font-semibold text-foreground tabular-nums">
                    {currentProduct.MAGNESIUM_MG ? `${Math.round(currentProduct.MAGNESIUM_MG)}` : '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ZONE 3: Intake Value Bar - Fixed position */}
          {valueRating && !outOfStock && (
            <div className="pt-1.5 border-t border-border/30 flex-shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-[7px] sm:text-[8px] font-heading font-medium text-muted-foreground uppercase tracking-wider">
                  Intake Value
                </span>
                <span className={`text-[9px] sm:text-[10px] font-bold bg-gradient-to-r ${getElectrolyteValueRatingColor(valueRating)} bg-clip-text text-transparent tabular-nums`}>
                  {valueRating}
                </span>
              </div>
              <div className="relative h-1.5 bg-muted/20 rounded-full overflow-hidden mt-0.5">
                <div 
                  className={`absolute inset-y-0 left-0 bg-gradient-to-r ${getElectrolyteValueRatingColor(valueRating)} rounded-full transition-all duration-500`}
                  style={{ width: `${(valueRating / 10) * 100}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Login Prompt Dialog */}
      <LoginPromptDialog 
        open={showLoginPrompt} 
        onOpenChange={setShowLoginPrompt} 
      />
    </>
  );
}
