import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ImageIcon, Crown, Zap, Droplets, Plus, Check } from "lucide-react";
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
import { useTileFit, getDetailsZoneClasses, getTextSizeClasses } from "@/hooks/useTileFit";
import { toTitleCase, formatBrand as formatBrandName, formatFlavour } from "@/utils/textFormatting";
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
  const cardRef = useRef<HTMLDivElement | null>(null);
  
  // 3-zone layout fit detection
  const { containerRef, contentRef, stage, isOverflowing } = useTileFit();
  
  // Handle variants
  const productHasVariants = hasVariants(product);
  const currentProduct = productHasVariants ? product.variants[selectedVariantIndex] : product;
  const variantCount = productHasVariants ? product.variantCount : 1;
  
  const { addToComparison, isInComparison, comparisonProducts } = useElectrolyteComparison();
  const isCompared = isInComparison(currentProduct);
  
  const activePrice = getActivePrice(currentProduct, isSubscription);
  const outOfStock = currentProduct.IN_STOCK === false;
  
  const valueRating = benchmarks && rankings
    ? calculateElectrolyteValueRating(currentProduct, benchmarks, rankings, isSubscription)
    : null;

  // Card click handler removed - only title should be hyperlinked

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

  const getBorderClass = () => {
    if (outOfStock) return 'border-border/20';
    if (isTopValueOfDay) return 'border-2 border-amber-400';
    if (isTopValue) return 'border border-primary/50';
    return 'border-border hover:border-primary/30';
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
    <Card 
      ref={cardRef}
      className={`h-[380px] sm:h-[420px] md:h-[460px] transition-all duration-300 group hover:shadow-card ${getBorderClass()} ${
        outOfStock ? 'opacity-60 grayscale' : 'hover:scale-[1.02]'
      } flex flex-col relative overflow-hidden rounded-lg border bg-card`}
    >
      {/* 
        3-ZONE CARD LAYOUT:
        Zone 1 (Image): flex-shrink-0 with bounded height
        Zone 2 (Details): flex-1 min-h-0 - scrollable when needed
        Zone 3 (Bottom Bar): flex-shrink-0 - always visible
      */}
      
      {/* ZONE 1: Product Image - Fixed proportion, never shrinks */}
      <div className="relative w-full h-[40%] overflow-hidden rounded-t-lg bg-white flex-shrink-0">
        {currentProduct.IMAGE_URL && !imageError ? (
          <img
            src={currentProduct.IMAGE_URL}
            alt={currentProduct.TITLE || "Product image"}
            className={`w-full h-full object-cover object-center transition-transform duration-300 rounded-t-lg ${
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

        {/* Special Product Badges */}
        <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 flex flex-col gap-1">
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

        {/* Format Badge */}
        {currentProduct.FORMAT && (
          <Badge variant="secondary" className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 text-[8px] sm:text-[9px]">
            {currentProduct.FORMAT}
          </Badge>
        )}
      </div>

      {/* Add to comparison button */}
      <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 z-[100] flex flex-col gap-1 sm:gap-1.5">
        {currentProduct.FORMAT && <div className="h-5 sm:h-6" />} {/* Spacer for format badge */}
        <Button
          onClick={handleAddToComparison}
          disabled={isCompared || comparisonProducts.length >= 4 || outOfStock}
          size="icon"
          className={`h-7 w-7 sm:h-8 sm:w-8 rounded-full shadow-lg transition-all duration-300 ${
            isCompared
              ? 'bg-blue-500 text-white cursor-default'
              : comparisonProducts.length >= 4
              ? 'bg-muted text-muted-foreground cursor-not-allowed'
              : 'bg-background/80 backdrop-blur-sm text-foreground hover:bg-blue-500 hover:text-white hover:scale-110'
          } ${addAnimation ? 'scale-125' : ''}`}
        >
          {isCompared ? (
            <Check className="h-3 w-3 sm:h-4 sm:w-4" />
          ) : (
            <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
          )}
        </Button>
      </div>

      {/* ZONE 2 & 3: Content Area */}
      <CardContent className="p-2 sm:p-2.5 md:p-3 flex flex-col flex-1 min-h-0">
        {/* ZONE 2: Details - Scrollable container when needed */}
        <div 
          ref={containerRef}
          className="flex-1 min-h-0 relative"
        >
          <div 
            ref={contentRef}
            className={getDetailsZoneClasses(stage)}
          >
            {/* Brand Name */}
            <p className={`${getTextSizeClasses(stage, 'brand')} uppercase tracking-wider text-muted-foreground font-medium truncate flex-shrink-0`}>
              {getBrandFromProduct(currentProduct)}
            </p>

            {/* Product Title - This is the ONLY hyperlink */}
            {currentProduct.PAGE_URL ? (
              <a
                href={currentProduct.PAGE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="block no-underline hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                <CardTitle
                  className={`${getTextSizeClasses(stage, 'title')} font-heading font-semibold line-clamp-2 leading-tight flex-shrink-0 text-foreground hover:text-primary transition-colors cursor-pointer`}
                  title={toTitleCase(safeDisplayValue(currentProduct.TITLE, "Product Title Not Available"))}
                >
                  {toTitleCase(safeDisplayValue(currentProduct.TITLE, "Product Title Not Available"))}
                </CardTitle>
              </a>
            ) : (
              <CardTitle
                className={`${getTextSizeClasses(stage, 'title')} font-heading font-semibold line-clamp-2 leading-tight flex-shrink-0`}
                title={toTitleCase(safeDisplayValue(currentProduct.TITLE, "Product Title Not Available"))}
              >
                {toTitleCase(safeDisplayValue(currentProduct.TITLE, "Product Title Not Available"))}
              </CardTitle>
            )}

            {/* Flavour Section */}
            <div 
              className="relative z-[150] flex-shrink-0" 
              onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
              onTouchStart={(e) => e.stopPropagation()}
              onTouchEnd={(e) => e.stopPropagation()}
            >
              {productHasVariants ? (
                <div className="flex items-center justify-between gap-1">
                  <Select
                    value={selectedVariantIndex.toString()}
                    onValueChange={handleVariantChange}
                  >
                    <SelectTrigger 
                      className={`${stage >= 1 ? 'h-4 sm:h-5' : 'h-5 sm:h-6'} text-[8px] sm:text-[9px] md:text-[10px] px-1.5 py-0 bg-background border-border/50 w-full`}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                      onTouchStart={(e) => e.stopPropagation()}
                      onTouchEnd={(e) => e.stopPropagation()}
                      onPointerDown={(e) => e.stopPropagation()}
                    >
                      <SelectValue placeholder="Select flavour">
                        {formatFlavour(safeDisplayValue(currentProduct.FLAVOUR, 'No flavour'))}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent 
                      className="bg-background border-border z-[200] max-h-48"
                      onPointerDownOutside={(e) => e.stopPropagation()}
                    >
                      {(product as GroupedElectrolyteProduct).variants.map((variant, idx) => (
                        <SelectItem 
                          key={idx} 
                          value={idx.toString()}
                          className="text-xs"
                        >
                          {formatFlavour(safeDisplayValue(variant.FLAVOUR, 'No flavour'))}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-[7px] sm:text-[8px] text-muted-foreground whitespace-nowrap">
                    +{variantCount - 1}
                  </span>
                </div>
              ) : (
                currentProduct.FLAVOUR && currentProduct.FLAVOUR !== 'Flavour' && (
                  <p
                    className={`${getTextSizeClasses(stage, 'flavour')} text-muted-foreground line-clamp-1 min-h-[14px]`}
                    title={formatFlavour(currentProduct.FLAVOUR)}
                  >
                    {formatFlavour(currentProduct.FLAVOUR)}
                  </p>
                )
              )}
            </div>

            {/* Price and Servings Row */}
            <div className={`flex items-center justify-between gap-1 ${stage >= 1 ? 'pt-0.5' : 'pt-1'} border-t border-border/20 flex-shrink-0`}>
              <div className="flex flex-col">
                {currentProduct.RRP_NUM && discountPercent && discountPercent > 0 && (
                  <span className="text-[8px] sm:text-[9px] text-muted-foreground line-through">
                    was £{currentProduct.RRP_NUM.toFixed(2)}
                  </span>
                )}
                <div className="flex items-center gap-1">
                  <span className={`${getTextSizeClasses(stage, 'price')} font-bold text-primary tabular-nums tracking-tight`}>
                    {formatPrice(activePrice)}
                  </span>
                  {discountPercent && discountPercent > 0 && (
                    <Badge className="bg-green-500/20 text-green-600 text-[8px] px-1 py-0">
                      -{discountPercent}%
                    </Badge>
                  )}
                </div>
              </div>
              <Badge variant="secondary" className={`${stage >= 1 ? 'text-[7px] sm:text-[8px] px-1 py-0' : 'text-[8px] sm:text-[9px] px-1.5 py-0.5'} font-medium`}>
                {currentProduct.SERVINGS || 'N/A'} servings
              </Badge>
            </div>

            {/* Subscription Amount */}
            {isSubscription && currentProduct.SUB_AMOUNT && (
              <div className={`flex items-center gap-1 bg-primary/10 border border-primary/20 rounded-md ${stage >= 1 ? 'px-1.5 py-0' : 'px-2 py-0.5'} flex-shrink-0`}>
                <Zap className="h-2.5 w-2.5 text-primary" />
                <span className={`${stage >= 1 ? 'text-[8px] sm:text-[9px]' : 'text-[9px] sm:text-[10px]'} font-semibold text-primary`}>
                  {currentProduct.SUB_AMOUNT}
                </span>
              </div>
            )}

            {/* Electrolyte Breakdown - Highlighted section */}
            <div className={`bg-blue-500/5 border border-blue-500/10 rounded-md ${stage >= 1 ? 'px-1.5 py-1' : 'px-2 py-1.5'} flex-shrink-0`}>
              <div className="flex items-center justify-between mb-0.5">
                <p className="text-[7px] sm:text-[8px] text-muted-foreground font-medium uppercase tracking-wide">
                  Electrolytes per serving
                </p>
                {totalElectrolytes > 0 && (
                  <span className={`${stage >= 1 ? 'text-[9px] sm:text-[10px]' : 'text-[10px] sm:text-[11px]'} font-bold text-blue-600 tabular-nums flex items-center gap-0.5`}>
                    <Droplets className="h-2.5 w-2.5" />
                    {Math.round(totalElectrolytes)}mg
                  </span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-1">
                <div className="text-center">
                  <p className="text-[7px] sm:text-[8px] text-muted-foreground">Na</p>
                  <p className={`${stage >= 1 ? 'text-[8px] sm:text-[9px]' : 'text-[9px] sm:text-[10px]'} font-semibold text-foreground tabular-nums`}>
                    {currentProduct.SODIUM_MG ? `${Math.round(currentProduct.SODIUM_MG)}` : '-'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[7px] sm:text-[8px] text-muted-foreground">K</p>
                  <p className={`${stage >= 1 ? 'text-[8px] sm:text-[9px]' : 'text-[9px] sm:text-[10px]'} font-semibold text-foreground tabular-nums`}>
                    {currentProduct.POTASSIUM_MG ? `${Math.round(currentProduct.POTASSIUM_MG)}` : '-'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[7px] sm:text-[8px] text-muted-foreground">Mg</p>
                  <p className={`${stage >= 1 ? 'text-[8px] sm:text-[9px]' : 'text-[9px] sm:text-[10px]'} font-semibold text-foreground tabular-nums`}>
                    {currentProduct.MAGNESIUM_MG ? `${Math.round(currentProduct.MAGNESIUM_MG)}` : '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Scroll fade indicator - only shows when scrollable */}
          {stage === 2 && isOverflowing && (
            <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-card to-transparent pointer-events-none" />
          )}
        </div>

        {/* ZONE 3: Intake Value Bar - Always visible, never scrolls */}
        {valueRating && !outOfStock && (
          <div className={`${stage >= 1 ? 'pt-1' : 'pt-1.5'} border-t border-border/30 flex-shrink-0`}>
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
                className={`absolute inset-y-0 left-0 bg-gradient-to-r ${getElectrolyteValueRatingColor(valueRating)} rounded-full transition-all duration-500 ${
                  valueRating >= 9.5 ? 'shadow-lg animate-[shimmer_2s_ease-in-out_infinite]' : 'shadow-sm'
                }`}
                style={{ 
                  width: `${(valueRating / 10) * 100}%`,
                  boxShadow: valueRating >= 8 ? '0 0 8px rgba(168, 85, 247, 0.5)' : undefined
                }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
