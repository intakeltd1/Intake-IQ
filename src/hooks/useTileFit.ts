import { useEffect, useRef, useState, useCallback } from "react";

export type FitStage = 0 | 1 | 2; // 0 = normal, 1 = compact, 2 = scroll

interface UseTileFitReturn {
  containerRef: React.RefObject<HTMLDivElement>;
  contentRef: React.RefObject<HTMLDivElement>;
  stage: FitStage;
  isOverflowing: boolean;
}

/**
 * Hook that detects overflow in a container and returns a stage:
 * - Stage 0: Normal layout (content fits)
 * - Stage 1: Compact layout (reduced spacing/padding)
 * - Stage 2: Enable scrolling (content still too large)
 * 
 * The hook uses ResizeObserver to monitor changes and recalculates on resize.
 */
export function useTileFit(): UseTileFitReturn {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState<FitStage>(0);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const calculateFit = useCallback(() => {
    if (!containerRef.current || !contentRef.current) return;

    const containerHeight = containerRef.current.clientHeight;
    const contentHeight = contentRef.current.scrollHeight;
    const overflow = contentHeight - containerHeight;

    // Thresholds for stage transitions
    const COMPACT_THRESHOLD = 10;  // > 10px overflow → try compact
    const SCROLL_THRESHOLD = 30;   // > 30px overflow even in compact → scroll

    if (overflow <= 0) {
      // Content fits perfectly
      setStage(0);
      setIsOverflowing(false);
    } else if (overflow <= COMPACT_THRESHOLD) {
      // Small overflow - stay normal but flag it
      setStage(0);
      setIsOverflowing(true);
    } else if (overflow <= SCROLL_THRESHOLD) {
      // Medium overflow - try compact layout
      setStage(1);
      setIsOverflowing(true);
    } else {
      // Large overflow - enable scrolling
      setStage(2);
      setIsOverflowing(true);
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;

    if (!container || !content) return;

    // Initial calculation
    calculateFit();

    // Watch for resize
    const resizeObserver = new ResizeObserver(() => {
      calculateFit();
    });

    resizeObserver.observe(container);
    resizeObserver.observe(content);

    // Also recalculate on window resize
    window.addEventListener("resize", calculateFit);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", calculateFit);
    };
  }, [calculateFit]);

  return {
    containerRef,
    contentRef,
    stage,
    isOverflowing,
  };
}

/**
 * Returns tailwind classes based on the fit stage for the details zone.
 */
export function getDetailsZoneClasses(stage: FitStage): string {
  const baseClasses = "flex-1 min-h-0 flex flex-col";
  
  switch (stage) {
    case 0:
      return `${baseClasses} gap-1`;
    case 1:
      return `${baseClasses} gap-0.5`; // Tighter gaps in compact mode
    case 2:
      return `${baseClasses} gap-0.5 overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent`;
    default:
      return baseClasses;
  }
}

/**
 * Returns tailwind classes for text sizing based on fit stage.
 */
export function getTextSizeClasses(stage: FitStage, type: 'brand' | 'title' | 'flavour' | 'price'): string {
  switch (type) {
    case 'brand':
      return stage >= 1 
        ? "text-[7px] sm:text-[8px] md:text-[9px]" 
        : "text-[8px] sm:text-[9px] md:text-[10px]";
    case 'title':
      return stage >= 1 
        ? "text-[10px] sm:text-[11px] md:text-[12px]" 
        : "text-[11px] sm:text-[12px] md:text-[13px]";
    case 'flavour':
      return stage >= 1 
        ? "text-[8px] sm:text-[9px]" 
        : "text-[9px] sm:text-[10px]";
    case 'price':
      return stage >= 1 
        ? "text-xs sm:text-sm md:text-base" 
        : "text-sm sm:text-base md:text-lg";
    default:
      return "";
  }
}
