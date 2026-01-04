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
  STOCK_STATUS?: string;
  RRP?: string;
  [key: string]: any;
}

interface ProductCardProps {
  product: Product & { variants?: Product[]; variantCount?: number };
  isTopValue?: boolean;
  isFeatured?: boolean;
  isPopular?: boolean;
  isTopValueOfDay?: boolean;
}

/* -----------------------------
   Utility helpers (unchanged)
-------------------------------- */

const isOutOfStock = (product: Product): boolean => {
  const stockIndicators = [
    product.STOCK_STATUS?.toLowerCase(),
    product.PRICE?.toLowerCase(),
    product.TITLE?.toLowerCase(),
    product.AMOUNT?.toLowerCase(),
  ];

  return (
    stockIndicators.some(
      (indicator) =>
        indicator?.includes("out of stock") ||
        indicator?.includes("unavailable") ||
        indicator?.includes("sold out") ||
        indicator === "out" ||
        indicator === "0"
    ) || false
  );
};

const extractBrandFromUrl = (url?: string): string | undefined => {
  if (!url) return undefined;
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host.includes("esn.com")) return "ESN";
    return host.split(".")[0].replace(/[-_]/g, " ");
  } catch {
    return undefined;
  }
};

const getBrandFromProduct = (product: Product): string =>
  formatBrandName(
    product.COMPANY ||
      extractBrandFromUrl(product.URL || product.LINK) ||
      "Unknown"
  );

const safeDisplayValue = (v: any, fallback = "N/A") =>
  v && String(v).toLowerCase() !== "nan" ? String(v) : fallback;

const formatProtein = (value?: string) => {
  if (!value) return "N/A";
  const m = value.match(/([\d.]+)\s*(g|mg)?/i);
  return m ? `${m[1]} g` : "N/A";
};

const getServingsOrAmountDisplay = (product: Product): string => {
  if (product.SERVINGS && isValidServings(product.SERVINGS)) {
    return `${Math.round(parseFloat(product.SERVINGS))} servings`;
  }
  const grams = parseGrams(product.AMOUNT);
  return grams ? formatAmount(grams) : "";
};

/* -----------------------------
   Component
-------------------------------- */

export function ProductCard({
  product,
  isTopValue,
  isFeatured,
  isPopular,
  isTopValueOfDay,
}: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [variantOpen, setVariantOpen] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);

  const { containerRef, contentRef, stage, isOverflowing } = useTileFit();

  /** 🔒 Freeze layout fitting while dropdown is open */
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

  const handleVariantChange = (v: string) => {
    setSelectedVariantIndex(parseInt(v, 10));
    setImageError(false);
  };

  return (
    <>
      <Card
        ref={cardRef}
        className={`h-[340px] sm:h-[380px] md:h-[420px] flex flex-col rounded-lg overflow-hidden transition-shadow duration-300 ${
          outOfStock ? "opacity-60 grayscale" : ""
        }`}
      >
        {/* IMAGE */}
        <div className="relative h-[45%] bg-white flex-shrink-0">
          {currentProduct.IMAGE_URL && !imageError ? (
            <img
              src={currentProduct.IMAGE_URL}
              alt={currentProduct.TITLE}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <ImageIcon className="h-10 w-10 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* CONTENT */}
        <CardContent className="flex flex-col flex-1 min-h-0 p-2">
          <div ref={containerRef} className="flex-1 min-h-0">
            <div
              ref={contentRef}
              className={getDetailsZoneClasses(effectiveStage)}
            >
              <p
                className={`${getTextSizeClasses(
                  effectiveStage,
                  "brand"
                )} uppercase text-muted-foreground`}
              >
                {getBrandFromProduct(currentProduct)}
              </p>

              <CardTitle
                className={`${getTextSizeClasses(
                  effectiveStage,
                  "title"
                )} line-clamp-2`}
              >
                {toTitleCase(
                  safeDisplayValue(currentProduct.TITLE, "Product")
                )}
              </CardTitle>

              {/* FLAVOUR SELECT (STABLE) */}
              <div className="relative min-h-[44px] flex-shrink-0 z-50">
                {hasVariants && (
                  <Select
                    value={String(selectedVariantIndex)}
                    onValueChange={handleVariantChange}
                    onOpenChange={setVariantOpen}
                  >
                    <SelectTrigger className="h-[44px] text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-[9999] max-h-64">
                      {product.variants!.map((v, i) => (
                        <SelectItem key={i} value={String(i)}>
                          {formatFlavour(v.FLAVOUR)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="flex justify-between pt-1 border-t">
                <span className="font-bold text-primary">
                  {safeDisplayValue(currentProduct.PRICE)}
                </span>
                <Badge variant="secondary">
                  {getServingsOrAmountDisplay(currentProduct)}
                </Badge>
              </div>
            </div>

            {effectiveStage === 2 && isOverflowing && (
              <div className="absolute bottom-0 h-4 w-full bg-gradient-to-t from-card to-transparent pointer-events-none" />
            )}
          </div>

          {/* VALUE BAR */}
          {valueRating && !outOfStock && (
            <div className="pt-1 border-t">
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
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
      </Card>

      <LoginPromptDialog
        open={showLoginPrompt}
        onOpenChange={setShowLoginPrompt}
      />
    </>
  );
}
