/**
 * ProductCardWithSizes - Enhanced product card with servings/amount size buttons
 * 
 * This component extends the base ProductCard functionality by adding:
 * - Size variant buttons (e.g., "33 servings", "66 servings" or "500g", "1kg")
 * - Cascading selection: Size → Flavour
 * - Uses SERVINGS as primary, AMOUNT as fallback
 * 
 * For easy reversal: Simply switch back to using ProductCard + groupProductsByTitle
 * in Index.tsx instead of ProductCardWithSizes + groupProductsByTitleOnly
 */

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { getAffiliateUrl, logAffiliateClick, getMerchantId, getAwinAttributes } from '@/utils/awinAffiliate';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ImageIcon, TrendingUp, Star, Plus, Crown, Heart } from "lucide-react";
import { useState, useRef, useMemo } from "react";
import { incrementClickCount, parseGrams, formatAmount, isValidServings, TitleGroupedProduct, SizeVariant } from "@/utils/productUtils";
import { useComparison } from "@/hooks/useComparison";
import { useValueBenchmarks } from "@/hooks/useValueBenchmarks";
import { usePriceTrend } from "@/hooks/usePriceTrend";
import { useAuth } from "@/hooks/useAuth";
import { useFavorites } from "@/hooks/useFavorites";
import { calculateIntakeValueRating, getValueRatingColor, getValueRatingLabel } from "@/utils/valueRating";
import { PriceTrendIcon } from "@/components/PriceTrendIcon";
import { LoginPromptDialog } from "@/components/LoginPromptDialog";
import { toTitleCase, formatBrand as formatBrandName, formatFlavour } from "@/utils/textFormatting";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Product {
  TITLE?: string;
  COMPANY?: string;
  PRICE?: string;
  AMOUNT?: string;
  PROTEIN_SERVING?: string;
  FLAVOUR?: string;
  LINK?: string;
  URL?: string;
  IMAGE_URL?: string;
  RRP?: string;
  IN_STOCK?: boolean;
  SERVINGS?: string;
  [key: string]: any;
}

interface ProductCardWithSizesProps {
  product: TitleGroupedProduct;
  isTopValue?: boolean;
  isFeatured?: boolean;
  isPopular?: boolean;
  isTopValueOfDay?: boolean;
}

const isOutOfStock = (product: Product): boolean => {
  if (product.IN_STOCK !== undefined && product.IN_STOCK !== null) {
    return !product.IN_STOCK;
  }
  return false;
};

// Brand extraction helpers
const extractBrandFromUrl = (url?: string): string | undefined => {
  if (!url) return undefined;
  try {
    const u = new URL(url);
    let host = u.hostname.toLowerCase().replace(/^www\./, '');
    if (host.includes('esn.com')) return 'ESN';
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

const getBrandFromProduct = (product: Product): string => {
  const candidate = (product.COMPANY || '').trim();
  const generic = new Set(['see website','see site','website','visit site','n/a','unknown','see web']);
  if (candidate && !generic.has(candidate.toLowerCase())) {
    return formatBrandName(candidate);
  }
  const url = product.URL || product.LINK || product.IMAGE_URL;
  const extracted = extractBrandFromUrl(url);
  return formatBrandName(extracted) || formatBrandName(candidate) || 'Unknown';
};

const formatProtein = (value?: string) => {
  if (!value || value === 'nan' || value === 'undefined' || String(value).toLowerCase() === 'nan') return 'N/A';
  const s = String(value).trim();
  if (!s || s === 'nan') return 'N/A';
  if (/[0-9]\s*(g|mg)\b/i.test(s)) {
    return s.replace(/\s*(g|mg)\b/i, ' $1');
  }
  const num = s.match(/[\d.]+/);
  return num ? `${num[0]} g` : s;
};

const safeDisplayValue = (value: any, fallback: string = 'N/A'): string => {
  if (value === undefined || value === null || value === 'nan' || 
      value === 'undefined' || String(value).toLowerCase() === 'nan' || 
      String(value).trim() === '') {
    return fallback;
  }
  return String(value);
};

const formatDisplayAmount = (amount?: string): string => {
  if (!amount || amount === 'nan' || amount === 'undefined') return '';
  const grams = parseGrams(amount);
  if (grams === null) return amount;
  return formatAmount(grams);
};

const getServingsOrAmountDisplay = (product: Product): string => {
  const servings = product.SERVINGS;
  if (servings && isValidServings(servings)) {
    const num = parseFloat(String(servings).replace(/[^\d.]/g, ''));
    if (!isNaN(num) && num > 0) {
      return `${Math.round(num)} servings`;
    }
  }
  const amount = formatDisplayAmount(product.AMOUNT);
  return amount || '';
};

export function ProductCardWithSizes({ product, isTopValue, isFeatured, isPopular, isTopValueOfDay }: ProductCardWithSizesProps) {
  const [imageError, setImageError] = useState(false);
  const [addAnimation, setAddAnimation] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const { benchmarks, scoreRange, rankings } = useValueBenchmarks();
  
  // Size and flavour selection state
  const sizeVariants = product.sizeVariants || [];
  
  // Helper to calculate intake value for a product (for sorting purposes)
  const getProductIntakeValue = (p: Product): number => {
    const rating = calculateIntakeValueRating(p, benchmarks || undefined, scoreRange || undefined, rankings || undefined);
    return rating || 0;
  };
  
  // Find best in-stock flavour within a size variant (highest intake value, in-stock)
  const getBestFlavourIndex = (flavours: Product[]): number => {
    // First, find all in-stock flavours
    const inStockIndices = flavours
      .map((p, idx) => ({ product: p, idx, inStock: !isOutOfStock(p) }))
      .filter(item => item.inStock);
    
    if (inStockIndices.length === 0) {
      // No in-stock items, return first one (will show as out of stock)
      return 0;
    }
    
    // Among in-stock, find the one with highest intake value
    let bestIdx = inStockIndices[0].idx;
    let bestValue = getProductIntakeValue(inStockIndices[0].product);
    
    for (const item of inStockIndices) {
      const value = getProductIntakeValue(item.product);
      if (value > bestValue) {
        bestValue = value;
        bestIdx = item.idx;
      }
    }
    
    return bestIdx;
  };
  
  // Find initial size index: best value among in-stock products across all sizes
  const getInitialSizeIndex = (): number => {
    let bestSizeIdx = 0;
    let bestOverallValue = -1;
    let hasAnyInStock = false;
    
    for (let i = 0; i < sizeVariants.length; i++) {
      const flavours = sizeVariants[i].flavourVariants;
      const inStockFlavours = flavours.filter(p => !isOutOfStock(p));
      
      if (inStockFlavours.length > 0) {
        hasAnyInStock = true;
        // Find best value in this size
        for (const p of inStockFlavours) {
          const value = getProductIntakeValue(p);
          if (value > bestOverallValue) {
            bestOverallValue = value;
            bestSizeIdx = i;
          }
        }
      }
    }
    
    // If no in-stock items anywhere, just return 0
    if (!hasAnyInStock) return 0;
    
    return bestSizeIdx;
  };
  
  const initialSizeIndex = useMemo(() => getInitialSizeIndex(), [sizeVariants, benchmarks, scoreRange, rankings]);
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(initialSizeIndex);
  const currentSize = sizeVariants[selectedSizeIndex] || sizeVariants[0];
  const flavourVariants = currentSize?.flavourVariants || [];
  
  // Get best flavour index for current size
  const initialFlavourIndex = useMemo(() => getBestFlavourIndex(flavourVariants), [flavourVariants, benchmarks, scoreRange, rankings]);
  const [selectedFlavourIndex, setSelectedFlavourIndex] = useState(initialFlavourIndex);
  
  // Current product based on selections
  const currentProduct = flavourVariants[selectedFlavourIndex] || flavourVariants[0] || product;
  
  const originalUrl = currentProduct.URL || currentProduct.LINK;
  const productUrl = getAffiliateUrl(originalUrl);
  
  const outOfStock = isOutOfStock(currentProduct);
  const { addToComparison, isInComparison, comparisonProducts } = useComparison();
  const valueRating = calculateIntakeValueRating(currentProduct, benchmarks || undefined, scoreRange || undefined, rankings || undefined);
  const priceTrend = usePriceTrend(productUrl);
  
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const isProductFavorited = productUrl ? isFavorite(productUrl) : false;
  
  const SHOW_VALUE_BAR_ALWAYS = true;
  
  const handleCardClick = (e: React.MouseEvent) => {
    const url = currentProduct.URL || currentProduct.LINK;
    if (url) {
      incrementClickCount(url);
    }
  };

  const handleAddToComparison = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!isInComparison(currentProduct) && comparisonProducts.length < 4) {
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

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    
    toggleFavorite(currentProduct);
  };

  const getBorderClass = () => {
    if (outOfStock) return 'border-border/20';
    if (isTopValueOfDay) return 'border-2 border-amber-400';
    if (isFeatured) return 'border border-border';
    if (isTopValue) return 'border border-primary/50';
    if (isPopular) return 'border-2 border-white';
    return 'border-border';
  };

  // Handle size selection
  const handleSizeChange = (index: number) => {
    setSelectedSizeIndex(index);
    setImageError(false);
    // Reset flavour to best value in-stock for new size
    const newFlavours = sizeVariants[index]?.flavourVariants || [];
    setSelectedFlavourIndex(getBestFlavourIndex(newFlavours));
  };

  // Handle flavour selection
  const handleFlavourChange = (value: string) => {
    const index = parseInt(value, 10);
    if (!isNaN(index)) {
      setSelectedFlavourIndex(index);
      setImageError(false);
    }
  };

  // Check if a size has any in-stock variants
  const sizeHasStock = (size: SizeVariant) => size.flavourVariants.some(p => !isOutOfStock(p));

  const cardContent = (
    <>
      {/* ZONE 1: Product Image */}
      <div className="relative w-full h-[140px] sm:h-[160px] md:h-[180px] overflow-hidden rounded-t-lg bg-white flex-shrink-0">
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

        {outOfStock && (
          <Badge variant="destructive" className="absolute bottom-2 left-2 text-[10px] sm:text-xs">
            Out of Stock
          </Badge>
        )}

        <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 flex flex-col gap-1">
          {isTopValueOfDay && !outOfStock && (
            <Badge className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-amber-900 font-bold shadow-xl animate-pulse flex items-center gap-1 border border-amber-300 text-[9px] sm:text-[10px]">
              <Crown className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              Top Value
            </Badge>
          )}
          {isFeatured && !outOfStock && !isTopValueOfDay && (
            <Badge className="bg-primary text-primary-foreground font-medium flex items-center gap-1 text-[9px] sm:text-[10px]">
              <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              Featured
            </Badge>
          )}
          {isTopValue && !outOfStock && !isFeatured && !isTopValueOfDay && (
            <Badge className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-white font-semibold shadow-lg text-[9px] sm:text-[10px]">
              Great Value
            </Badge>
          )}
          {isPopular && !outOfStock && !isFeatured && !isTopValue && !isTopValueOfDay && (
            <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium flex items-center gap-1 text-[9px] sm:text-[10px]">
              <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              Popular
            </Badge>
          )}
        </div>
      </div>

      {/* ZONE 2: Content Area */}
      <CardContent className="p-2 sm:p-2.5 md:p-3 flex flex-col flex-1 overflow-hidden">
        <div className="flex flex-col gap-1 flex-1 min-h-0">
          {/* Brand */}
          <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-muted-foreground font-medium truncate">
            {getBrandFromProduct(currentProduct)}
          </p>

          {/* Title */}
          {productUrl ? (
            <a
              href={productUrl}
              target="_blank"
              rel="noopener noreferrer"
              {...getAwinAttributes(originalUrl || '')}
              onClick={(e) => {
                handleCardClick(e);
                logAffiliateClick(originalUrl || '', !!getMerchantId(originalUrl || ''));
              }}
              className="block no-underline"
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

          {/* SIZE VARIANT BUTTONS - New Feature */}
          {sizeVariants.length > 1 && (
            <div 
              className="flex flex-wrap gap-1 py-1"
              onClick={(e) => e.stopPropagation()}
            >
              {sizeVariants.map((size, idx) => {
                const isSelected = idx === selectedSizeIndex;
                const hasStock = sizeHasStock(size);
                
                return (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSizeChange(idx);
                    }}
                    className={`
                      px-2 py-0.5 text-[9px] sm:text-[10px] rounded-full border transition-all
                      ${isSelected 
                        ? 'bg-primary text-primary-foreground border-primary font-semibold' 
                        : hasStock 
                          ? 'bg-background border-border hover:border-primary/50 hover:bg-primary/5'
                          : 'bg-muted/50 border-border/50 text-muted-foreground opacity-60'
                      }
                    `}
                    disabled={!hasStock}
                    title={hasStock ? size.sizeLabel : `${size.sizeLabel} (out of stock)`}
                  >
                    {size.sizeLabel}
                  </button>
                );
              })}
            </div>
          )}

          {/* Flavour Dropdown */}
          <div 
            className="relative z-[500] isolate mb-1" 
            onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
            onTouchStart={(e) => e.stopPropagation()}
          >
            {flavourVariants.length > 1 ? (
              <div className="flex items-center justify-between gap-1">
                <Select
                  value={selectedFlavourIndex.toString()}
                  onValueChange={handleFlavourChange}
                >
                  <SelectTrigger 
                    className="min-h-[36px] sm:min-h-[32px] h-auto text-[10px] sm:text-xs px-2 py-1 bg-background border-border w-full touch-manipulation"
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
                    {flavourVariants.map((variant, idx) => (
                      <SelectItem 
                        key={idx} 
                        value={idx.toString()}
                        className="text-sm min-h-[40px] py-2 touch-manipulation"
                      >
                        {formatFlavour(safeDisplayValue(variant.FLAVOUR, 'No flavour'))}
                        {isOutOfStock(variant) && ' (Out of Stock)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-[8px] sm:text-[9px] text-muted-foreground whitespace-nowrap">
                  +{flavourVariants.length - 1}
                </span>
              </div>
            ) : (
              <p
                className="text-[10px] sm:text-[11px] text-muted-foreground line-clamp-1 min-h-[14px]"
                title={formatFlavour(safeDisplayValue(currentProduct.FLAVOUR, ''))}
              >
                {formatFlavour(safeDisplayValue(currentProduct.FLAVOUR, ''))}
              </p>
            )}
          </div>

          {/* Price and Info Row */}
          <div className="flex items-center justify-between gap-1 pt-1 border-t border-border/20">
            <div className="flex flex-col">
              {currentProduct.RRP && currentProduct.RRP !== currentProduct.PRICE && (
                <span className="text-[8px] sm:text-[9px] text-muted-foreground line-through">
                  was {safeDisplayValue(currentProduct.RRP)}
                </span>
              )}
              <span className="text-sm sm:text-base font-bold text-primary tabular-nums tracking-tight">
                {safeDisplayValue(currentProduct.PRICE, "Price N/A")}
              </span>
            </div>
            {/* Hide servings badge when size buttons already show servings info */}
            {sizeVariants.length <= 1 && getServingsOrAmountDisplay(currentProduct) && (
              <Badge variant="secondary" className="text-[8px] sm:text-[9px] px-1.5 py-0.5 font-medium">
                {getServingsOrAmountDisplay(currentProduct)}
              </Badge>
            )}
          </div>

          {/* Protein */}
          {formatProtein(currentProduct.PROTEIN_SERVING) !== 'N/A' && (
            <div className="bg-primary/5 border border-primary/10 rounded-md px-2 py-1">
              <p className="text-[7px] sm:text-[8px] text-muted-foreground font-medium uppercase tracking-wide mb-0.5">
                Grams of protein per serving
              </p>
              <p className="text-sm sm:text-base font-bold text-primary tabular-nums leading-none">
                {formatProtein(currentProduct.PROTEIN_SERVING)}
              </p>
            </div>
          )}
        </div>

        {/* Value Bar */}
        {(SHOW_VALUE_BAR_ALWAYS || comparisonProducts.length > 0) && valueRating && !outOfStock && (
          <div className="pt-1.5 border-t border-border/30 flex-shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-[7px] sm:text-[8px] font-heading font-medium text-muted-foreground uppercase tracking-wider">
                Intake Value
              </span>
              <span className={`text-[9px] sm:text-[10px] font-bold bg-gradient-to-r ${getValueRatingColor(valueRating)} bg-clip-text text-transparent tabular-nums`}>
                {valueRating}
              </span>
            </div>
            <div className="relative h-1.5 bg-muted/20 rounded-full overflow-hidden mt-0.5">
              <div 
                className={`absolute inset-y-0 left-0 bg-gradient-to-r ${getValueRatingColor(valueRating)} rounded-full transition-all duration-500`}
                style={{ width: `${(valueRating / 10) * 100}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </>
  );

  return (
    <>
      <Card 
        ref={cardRef}
        className={`h-[420px] sm:h-[460px] md:h-[500px] group ${getBorderClass()} ${
          outOfStock ? 'opacity-60 grayscale' : ''
        } flex flex-col relative overflow-hidden rounded-lg`}
      >
        {/* Right-side icon stack */}
        <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 z-[100] flex flex-col gap-1 sm:gap-1.5">
          <Button
            onClick={handleAddToComparison}
            disabled={isInComparison(currentProduct) || comparisonProducts.length >= 4 || outOfStock}
            size="sm"
            variant="outline"
            className={`h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 p-0 border-2 backdrop-blur-sm rounded-full ${
              addAnimation ? 'scale-0' : ''
            } ${
              isInComparison(currentProduct) 
                ? 'bg-purple-500 border-purple-500 text-white' 
                : 'bg-background/80 border-white/60 text-white'
            }`}
          >
            <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 font-bold" />
          </Button>

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

          {priceTrend && !outOfStock && (
            <PriceTrendIcon trend={priceTrend} />
          )}
        </div>

        <div className="h-full flex flex-col">
          {cardContent}
        </div>
      </Card>

      <LoginPromptDialog 
        open={showLoginPrompt} 
        onOpenChange={setShowLoginPrompt} 
      />
    </>
  );
}
