// ProductCard.tsx
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

/* ---------- types & helpers unchanged ---------- */

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
  const [variantOpen, setVariantOpen] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);

  const { containerRef, contentRef, stage, isOverflowing } = useTileFit();
  const effectiveStage = variantOpen ? 0 : stage;

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
  const isProductFavorited = productUrl
    ? isFavorite(productUrl)
    : false;

  const handleVariantChange = (value: string) => {
    const idx = parseInt(value, 10);
    if (!isNaN(idx)) {
      setSelectedVariantIndex(idx);
      setImageError(false);
      setVariantOpen(false);
    }
  };

  return (
    <>
      <Card
        ref={cardRef}
        className="relative h-[340px] sm:h-[380px] md:h-[420px] flex flex-col overflow-hidden rounded-lg"
      >
        {/* ✅ Gold border BEHIND content */}
        {isTopValueOfDay && (
          <div className="absolute inset-0 rounded-lg ring-2 ring-amber-400 pointer-events-none z-0" />
        )}

        <div className="relative z-10 h-full flex flex-col">
          {/* ---------- IMAGE ZONE ---------- */}
          <div className="relative h-[45%] bg-white overflow-hidden">
            {currentProduct.IMAGE_URL && !imageError ? (
              <img
                src={currentProduct.IMAGE_URL}
                alt={currentProduct.TITLE}
                className={`w-full h-full object-cover ${
                  outOfStock ? "grayscale" : ""
                }`}
                loading="lazy"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <ImageIcon className="h-10 w-10 text-muted-foreground" />
              </div>
            )}

            {/* ---------- BADGES (RESTORED) ---------- */}
            <div className="absolute top-2 left-2 z-20 flex flex-col gap-1">
              {isTopValueOfDay && !outOfStock && (
                <Badge className="bg-amber-400 text-amber-900 text-[10px]">
                  <Crown className="h-3 w-3 mr-1" /> Top Value
                </Badge>
              )}
              {isFeatured && !outOfStock && (
                <Badge className="bg-primary text-[10px]">
                  <Star className="h-3 w-3 mr-1" /> Featured
                </Badge>
              )}
              {isTopValue && !outOfStock && (
                <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-[10px]">
                  Great Value
                </Badge>
              )}
              {isPopular && !outOfStock && (
                <Badge className="bg-orange-500 text-[10px]">
                  <TrendingUp className="h-3 w-3 mr-1" /> Popular
                </Badge>
              )}
            </div>
          </div>

          {/* ---------- CONTENT ---------- */}
          <CardContent className="flex flex-col flex-1 min-h-0 p-2">
            <div ref={containerRef} className="flex-1 min-h-0">
              <div
                ref={contentRef}
                className={getDetailsZoneClasses(effectiveStage)}
              >
                <p className={`${getTextSizeClasses(effectiveStage, "brand")} uppercase`}>
                  {getBrandFromProduct(currentProduct)}
                </p>

                <CardTitle className={getTextSizeClasses(effectiveStage, "title")}>
                  {toTitleCase(currentProduct.TITLE || "")}
                </CardTitle>

                {/* ---------- FLAVOUR (STABLE) ---------- */}
                <div className="min-h-[44px]">
                  {hasVariants && (
                    <Select
                      value={selectedVariantIndex.toString()}
                      onValueChange={handleVariantChange}
                      onOpenChange={setVariantOpen}
                    >
                      <SelectTrigger>
                        <SelectValue />
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

                {/* ---------- PRICE & PROTEIN (RESTORED) ---------- */}
                <div className="border-t pt-1">
                  <span className="font-bold text-primary">
                    {currentProduct.PRICE}
                  </span>
                </div>

                {formatProtein(currentProduct.PROTEIN_SERVING) !== "N/A" && (
                  <div className="mt-1 rounded bg-primary/5 p-1">
                    <p className="text-[10px] uppercase">
                      Protein per serving
                    </p>
                    <p className="font-bold">
                      {formatProtein(currentProduct.PROTEIN_SERVING)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ---------- VALUE BAR (RESTORED) ---------- */}
            {valueRating && !outOfStock && (
              <div className="pt-1 border-t">
                <div className="h-1 bg-muted rounded overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${getValueRatingColor(
                      valueRating
                    )}`}
                    style={{ width: `${(valueRating / 10) * 100}%` }}
                  />
                </div>
              </div>
            )}
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
