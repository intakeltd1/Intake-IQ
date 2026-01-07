// Intake Value Rating Algorithm - IMPROVED
// RANK-BASED scoring: distributes scores across full 5.0-10.0 range
// Only ONE product can score 10.0 (ties broken by secondary factors)
// Weights: 50% Protein/£, 45% Servings/£, 5% Discount %

import { isValidServings, parseGrams } from '@/utils/productUtils';

interface Product {
  PRICE?: string;
  RRP?: string;
  SERVINGS?: string;
  PROTEIN_SERVING?: string;
  AMOUNT?: string;
  URL?: string;
  LINK?: string;
  TITLE?: string;
  FLAVOUR?: string;
  [key: string]: any;
}

export interface DatasetBenchmarks {
  minProteinPerPound: number;
  maxProteinPerPound: number;
  minServingsPerPound: number;
  maxServingsPerPound: number;
  minAmountPerPound: number;
  maxAmountPerPound: number;
  minDiscountPercent: number;
  maxDiscountPercent: number;
}

// Parse price from string
const parsePrice = (price?: string): number | null => {
  if (!price) return null;
  const match = String(price).replace(/[^\d.]/g, '');
  const value = parseFloat(match);
  return isNaN(value) || value <= 0 ? null : value;
};

// Parse servings from string - returns null for invalid formats (mass/volume units)
const parseServings = (servings?: string): number | null => {
  if (!servings) return null;
  
  // Validate that this is actually a serving count, not a weight like "500g"
  if (!isValidServings(servings)) return null;
  
  const match = String(servings).replace(/[^\d.]/g, '');
  const value = parseFloat(match);
  return isNaN(value) || value <= 0 ? null : value;
};

// SMART FALLBACK: Estimate servings from AMOUNT when SERVINGS is missing
const estimateServingsFromAmount = (amountGrams: number | null): number | null => {
  if (!amountGrams || amountGrams <= 0) return null;
  
  // Industry standard serving size is ~30g
  // This gives realistic estimates:
  // 500g → 16.7 servings
  // 1kg → 33.3 servings
  // 2.5kg → 83.3 servings
  // 5kg → 166.7 servings
  const STANDARD_SERVING_SIZE_GRAMS = 30;
  
  return amountGrams / STANDARD_SERVING_SIZE_GRAMS;
};

// Parse protein from string
const parseProtein = (protein?: string): number | null => {
  if (!protein) return null;
  const match = String(protein).replace(/[^\d.]/g, '');
  const value = parseFloat(match);
  return isNaN(value) ? null : value;
};

// Calculate percentage discount
const calculateDiscountPercent = (price?: string, rrp?: string): number => {
  const priceVal = parsePrice(price);
  const rrpVal = parsePrice(rrp);
  
  if (!priceVal || !rrpVal || rrpVal <= priceVal) return 0;
  
  return ((rrpVal - priceVal) / rrpVal) * 100;
};

// Calculate raw metrics for a product
const calculateRawMetrics = (product: Product) => {
  const price = parsePrice(product.PRICE);
  const servings = parseServings(product.SERVINGS);
  const protein = parseProtein(product.PROTEIN_SERVING);
  const discountPercent = calculateDiscountPercent(product.PRICE, product.RRP);
  
  // Parse AMOUNT for fallback calculations
  const amountGrams = parseGrams(product.AMOUNT);
  
  // SMART FALLBACK: If SERVINGS is missing/invalid, estimate from AMOUNT
  const effectiveServings = servings !== null 
    ? servings 
    : estimateServingsFromAmount(amountGrams);
  
  return {
    proteinPerPound: price && protein ? protein / price : null,
    servingsPerPound: price && effectiveServings ? effectiveServings / price : null,
    amountPerPound: price && amountGrams ? amountGrams / price : null,
    discountPercent,
    hasValidServings: servings !== null,
    hasValidAmount: amountGrams !== null,
    usedEstimatedServings: servings === null && effectiveServings !== null,
    price: price
  };
};

/**
 * Calculate benchmarks from entire dataset
 * Call this once when data loads, then use for all ratings
 */
export function calculateDatasetBenchmarks(products: Product[]): DatasetBenchmarks {
  let minProteinPerPound = Infinity;
  let maxProteinPerPound = 0;
  let minServingsPerPound = Infinity;
  let maxServingsPerPound = 0;
  let minAmountPerPound = Infinity;
  let maxAmountPerPound = 0;
  let minDiscountPercent = 0;
  let maxDiscountPercent = 0;

  for (const product of products) {
    const metrics = calculateRawMetrics(product);
    
    if (metrics.proteinPerPound !== null) {
      minProteinPerPound = Math.min(minProteinPerPound, metrics.proteinPerPound);
      maxProteinPerPound = Math.max(maxProteinPerPound, metrics.proteinPerPound);
    }
    
    if (metrics.servingsPerPound !== null) {
      minServingsPerPound = Math.min(minServingsPerPound, metrics.servingsPerPound);
      maxServingsPerPound = Math.max(maxServingsPerPound, metrics.servingsPerPound);
    }
    
    if (metrics.amountPerPound !== null) {
      minAmountPerPound = Math.min(minAmountPerPound, metrics.amountPerPound);
      maxAmountPerPound = Math.max(maxAmountPerPound, metrics.amountPerPound);
    }
    
    maxDiscountPercent = Math.max(maxDiscountPercent, metrics.discountPercent);
  }

  // Handle edge cases where no valid data exists
  if (minProteinPerPound === Infinity) minProteinPerPound = 0;
  if (minServingsPerPound === Infinity) minServingsPerPound = 0;
  if (minAmountPerPound === Infinity) minAmountPerPound = 0;

  return {
    minProteinPerPound,
    maxProteinPerPound,
    minServingsPerPound,
    maxServingsPerPound,
    minAmountPerPound,
    maxAmountPerPound,
    minDiscountPercent,
    maxDiscountPercent
  };
}

// Normalize a value to 0-1 range
const normalize = (value: number, min: number, max: number): number => {
  if (max === min) return 0.5;
  return (value - min) / (max - min);
};

/**
 * Calculate raw weighted score for a product (internal use)
 * Returns { score, hasMissingData } to track data quality
 * 
 * NEW WEIGHTS: 50% Protein/£, 45% Servings/£, 5% Discount
 * SMART FALLBACK: Estimates servings from amount (grams ÷ 30) when servings missing
 */
function calculateRawWeightedScore(
  product: Product,
  benchmarks: DatasetBenchmarks
): { score: number; hasMissingData: boolean; proteinPerPound: number | null; price: number | null } | null {
  const price = parsePrice(product.PRICE);
  if (!price) return null; // Products without price cannot be scored
  
  const metrics = calculateRawMetrics(product);
  
  // Track if product has missing essential data
  // Now more lenient: only flag as missing if we can't get servings at all (even via estimation)
  const hasMissingData = metrics.proteinPerPound === null || metrics.servingsPerPound === null;
  
  // Normalize protein per £1 (penalize missing data with 0.15)
  const normalizedProtein = metrics.proteinPerPound !== null
    ? normalize(metrics.proteinPerPound, benchmarks.minProteinPerPound, benchmarks.maxProteinPerPound)
    : 0.15;
  
  // Normalize servings per £1 (now includes estimated servings from amount)
  const normalizedServings = metrics.servingsPerPound !== null
    ? normalize(metrics.servingsPerPound, benchmarks.minServingsPerPound, benchmarks.maxServingsPerPound)
    : 0.15;
  
  // Normalize discount %
  const normalizedDiscount = benchmarks.maxDiscountPercent > 0
    ? normalize(metrics.discountPercent, benchmarks.minDiscountPercent, benchmarks.maxDiscountPercent)
    : 0;
  
  // NEW WEIGHTS: 50% protein, 45% servings, 5% discount
  const score = (normalizedProtein * 0.50) + (normalizedServings * 0.45) + (normalizedDiscount * 0.05);
  
  return { 
    score, 
    hasMissingData,
    proteinPerPound: metrics.proteinPerPound,
    price: metrics.price
  };
}

// Get unique identifier for a product
function getProductKey(product: Product): string {
  return product.URL || product.LINK || `${product.TITLE}-${product.FLAVOUR}-${product.PRICE}`;
}

export interface ScoreRange {
  minScore: number;
  maxScore: number;
}

/**
 * DEPRECATED: Use calculateProductRankings instead
 */
export function calculateScoreRange(
  products: Product[],
  benchmarks: DatasetBenchmarks
): ScoreRange {
  let minScore = Infinity;
  let maxScore = -Infinity;
  
  for (const product of products) {
    const result = calculateRawWeightedScore(product, benchmarks);
    if (result !== null) {
      minScore = Math.min(minScore, result.score);
      maxScore = Math.max(maxScore, result.score);
    }
  }
  
  if (minScore === Infinity) minScore = 0;
  if (maxScore === -Infinity) maxScore = 1;
  if (minScore === maxScore) maxScore = minScore + 0.01;
  
  return { minScore, maxScore };
}

export interface ProductRankings {
  rankMap: Map<string, number>;
  totalRankedProducts: number;
  rawScores: Map<string, number>;
  hasMissingDataMap: Map<string, boolean>;
}

/**
 * Calculate rank-based scores for all products
 * IMPROVED: Breaks ties to ensure only ONE product gets 10.0
 * Tie-breaking order: Higher protein/£ wins, then lower price
 */
export function calculateProductRankings(
  products: Product[],
  benchmarks: DatasetBenchmarks
): ProductRankings {
  // Calculate raw scores for all products
  const scoredProducts: { 
    key: string; 
    score: number; 
    hasMissingData: boolean;
    proteinPerPound: number | null;
    price: number | null;
  }[] = [];
  const rawScores = new Map<string, number>();
  const hasMissingDataMap = new Map<string, boolean>();
  
  for (const product of products) {
    const result = calculateRawWeightedScore(product, benchmarks);
    if (result !== null) {
      const key = getProductKey(product);
      scoredProducts.push({ 
        key, 
        score: result.score, 
        hasMissingData: result.hasMissingData,
        proteinPerPound: result.proteinPerPound,
        price: result.price
      });
      rawScores.set(key, result.score);
      hasMissingDataMap.set(key, result.hasMissingData);
    }
  }
  
  // Sort with tie-breaking:
  // 1. Higher score wins
  // 2. If tied, higher protein per £ wins
  // 3. If still tied, lower price wins
  scoredProducts.sort((a, b) => {
    // Primary: score (descending)
    if (Math.abs(b.score - a.score) >= 0.0001) {
      return b.score - a.score;
    }
    
    // Tie-breaker 1: protein per £ (descending)
    const aProtein = a.proteinPerPound ?? 0;
    const bProtein = b.proteinPerPound ?? 0;
    if (Math.abs(bProtein - aProtein) >= 0.01) {
      return bProtein - aProtein;
    }
    
    // Tie-breaker 2: price (ascending - lower is better)
    const aPrice = a.price ?? Infinity;
    const bPrice = b.price ?? Infinity;
    return aPrice - bPrice;
  });
  
  // Assign sequential ranks (no ties now!)
  const rankMap = new Map<string, number>();
  for (let i = 0; i < scoredProducts.length; i++) {
    rankMap.set(scoredProducts[i].key, i + 1);
  }
  
  return {
    rankMap,
    totalRankedProducts: scoredProducts.length,
    rawScores,
    hasMissingDataMap
  };
}

/**
 * Calculate Intake Value Rating using RANK-BASED scoring (5.0-10.0 scale)
 * GUARANTEED: Only ONE product can score 10.0 (ties broken by protein/£ then price)
 * 
 * @param product - Product to evaluate
 * @param benchmarks - Dataset benchmarks for normalization
 * @param scoreRange - DEPRECATED: kept for backward compatibility
 * @param rankings - Rank-based scoring data (preferred method)
 * @returns Value rating from 5.0-10.0
 */
export function calculateIntakeValueRating(
  product: Product, 
  benchmarks?: DatasetBenchmarks,
  scoreRange?: ScoreRange,
  rankings?: ProductRankings
): number | null {
  if (!benchmarks) return null;
  
  // Check if price is missing
  const price = product.PRICE?.replace(/[^\d.]/g, '');
  const priceVal = price ? parseFloat(price) : null;
  if (!priceVal || priceVal <= 0) {
    return null;
  }
  
  // Use rank-based scoring if rankings are provided
  if (rankings && rankings.totalRankedProducts > 0) {
    const key = getProductKey(product);
    const rank = rankings.rankMap.get(key);
    
    if (rank === undefined) {
      return null;
    }
    
    const hasMissingData = rankings.hasMissingDataMap.get(key) ?? false;
    
    // Convert rank to 5.0-10.0 scale
    const totalProducts = rankings.totalRankedProducts;
    
    let finalScore: number;
    if (totalProducts === 1) {
      finalScore = 10.0;
    } else {
      // Rank is 1-based, so rank 1 = best
      // percentile: 0 = worst rank, 1 = best rank
      const percentile = (totalProducts - rank) / (totalProducts - 1);
      finalScore = 5.0 + (percentile * 5.0);
    }
    
    // CAP: Products with missing data cannot score above 5.1
    if (hasMissingData && finalScore > 5.1) {
      finalScore = 5.1;
    }
    
    return Math.round(finalScore * 10) / 10;
  }
  
  // Fallback to old method
  const rawResult = calculateRawWeightedScore(product, benchmarks);
  if (rawResult === null) return null;
  
  let finalScore: number;
  if (!scoreRange) {
    finalScore = 5 + rawResult.score * 5;
  } else {
    const normalizedScore = Math.max(0, Math.min(1, normalize(rawResult.score, scoreRange.minScore, scoreRange.maxScore)));
    finalScore = 5.0 + (normalizedScore * 5.0);
  }
  
  if (rawResult.hasMissingData && finalScore > 5.1) {
    finalScore = 5.1;
  }
  
  return Math.round(finalScore * 10) / 10;
}

/**
 * Get color class for value rating (5.0-10.0 scale)
 * Purple = Excellent (9.5+), Green = Great (7+), Amber = Good (6+), Gray = Average
 */
export function getValueRatingColor(rating: number): string {
  if (rating >= 9.5) return 'from-purple-500 via-violet-500 to-purple-600';
  if (rating >= 7) return 'from-lime-400 to-green-400';
  if (rating >= 6) return 'from-amber-300 to-yellow-400';
  return 'from-gray-300 to-slate-300';
}

/**
 * Get label for value rating (5.0-10.0 scale)
 */
export function getValueRatingLabel(rating: number): string {
  if (rating >= 9.5) return 'Excellent';
  if (rating >= 7) return 'Great';
  if (rating >= 6) return 'Good';
  return 'Average';
}

/**
 * Get detailed explanation of Intake Value score
 * NEW: Helps users understand what the rating means
 */
export function getValueRatingExplanation(rating: number): string {
  if (rating >= 9.5) {
    return 'Outstanding value - among the best protein per pound in the market';
  }
  if (rating >= 7) {
    return 'Great value - significantly better than average';
  }
  if (rating >= 6) {
    return 'Good value - solid choice for your money';
  }
  if (rating >= 5.5) {
    return 'Fair value - average market pricing';
  }
  return 'Below average value - consider alternatives';
}
