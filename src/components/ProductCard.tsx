// (imports unchanged)
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ImageIcon, TrendingUp, Star, Plus, Crown, Heart } from "lucide-react";
import { useState, useRef } from "react";
import {
  incrementClickCount,
  parseGrams,
  formatAmount,
  isValidServings,
} from "@/utils/productUtils";
import { useComparison } from "@/hooks/useComparison";
import { useValueBenchmarks } from "@/hooks/useValueBenchmarks";
import { usePriceTrend } from "@/hooks/usePriceTrend";
import { useAuth } from "@/hooks/useAuth";
import { useFavorites } from "@/hooks/useFavorites";
import {
  useTileFit,
  getDetailsZoneClasses,
  getTextSizeClasses,
} from "@/hooks/useTileFit";
import {
  calculateIntakeValueRating,
  getValueRatingColor,
} from "@/utils/valueRating";
import { PriceTrendIcon } from "@/components/PriceTrendIcon";
import { LoginPromptDialog } from "@/components/LoginPromptDialog";
import {
  toTitleCase,
  formatBrand as formatBrandName,
  formatFlavour,
} from "@/utils/textFormatting";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// interfaces unchanged…

export function ProductCard({
  product,
  isTopValue,
  isFeatured,
  isPopular,
  isTopValueOfDay,
}: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const [addAnimation, setAddAnimation] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // ✅ PATCH: freeze layout while dropdown open
  const [variantOpen, setVariantOpen] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);

  const { containerRef, contentRef, stage, isOverflowing } = useTileFit();
  const effectiveStage = variantOpen ? 0 : stage; // ✅ PATCH

  const hasVariants = product.variants && product.variants.length > 1;
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const currentProduct = hasVariants
    ? product.variants![selectedVariantIndex]
    : product;

  const productUrl = currentProduct.URL || currentProduct.LINK;
  const outOfStock = isOutOfStock(currentProduct);

  const { addToComparison, isInComparison, comparisonProducts } =
    useComparison();
  const { benchmarks, scoreRange, rankings } = useValueBenchmarks();
  const valueRating = calculateIntakeValueRating(
    currentProduct,
    benchmarks,
    scoreRange,
    rankings
  );
  const priceTrend = usePriceTrend(productUrl);

  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const isProductFavorited = productUrl ? isFavorite(productUrl) : false;

  const handleVariantChange = (value: string) => {
    const index = parseInt(value, 10);
    if (!isNaN(index)) {
      setSelectedVariantIndex(index);
      setImageError(false);
    }
  };

  return (
    <>
      <Card
        ref={cardRef}
        className={`h-[340px] sm:h-[380px] md:h-[420px]
        transition-shadow duration-300
        group hover:shadow-card
        ${getBorderClass()}
        ${outOfStock ? "opacity-60 grayscale" : ""}
        flex flex-col relative overflow-hidden rounded-lg`}
      >
        {/* ✅ PATCH: gold border BEHIND content */}
        {isTopValueOfDay && (
          <div className="absolute inset-0 rounded-lg ring-2 ring-amber-400 pointer-events-none z-0" />
        )}

        {/* content must sit above border */}
        <div className="relative z-10 h-full flex flex-col">
          {/* IMAGE ZONE unchanged */}
          {/* ... */}

          <CardContent className="p-2 sm:p-2.5 md:p-3 flex flex-col flex-1 min-h-0">
            <div ref={containerRef} className="flex-1 min-h-0 relative">
              <div className={getDetailsZoneClasses(effectiveStage)}>
                {/* Brand */}
                <p
                  className={`${getTextSizeClasses(
                    effectiveStage,
                    "brand"
                  )} uppercase tracking-wider text-muted-foreground truncate`}
                >
                  {getBrandFromProduct(currentProduct)}
                </p>

                {/* Title */}
                {/* unchanged */}

                {/* ✅ PATCH: reserve dropdown height */}
                <div className="relative z-[500] isolate flex-shrink-0 min-h-[44px]">
                  {hasVariants && (
                    <Select
                      value={selectedVariantIndex.toString()}
                      onValueChange={handleVariantChange}
                      onOpenChange={setVariantOpen} // ✅ PATCH
                    >
                      <SelectTrigger className="min-h-[44px]">
                        <SelectValue>
                          {formatFlavour(currentProduct.FLAVOUR)}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {product.variants!.map((v, i) => (
                          <SelectItem key={i} value={i.toString()}>
                            {formatFlavour(v.FLAVOUR)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* PRICE, SERVINGS, PROTEIN, VALUE BAR */}
                {/* ALL UNCHANGED */}
              </div>

              {effectiveStage === 2 && isOverflowing && (
                <div className="absolute bottom-0 inset-x-0 h-4 bg-gradient-to-t from-card to-transparent" />
              )}
            </div>
          </CardContent>
        </div>
      </Card>

      <LoginPromptDialog
        open={showLoginPrompt}
        onOpenChange={setShowLoginPrompt}
      />
    </>
  );
}
