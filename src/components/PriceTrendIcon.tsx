import { PriceTrend } from '@/hooks/usePriceTrend';
import { TrendingDown, TrendingUp } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface PriceTrendIconProps {
  trend: PriceTrend;
  className?: string;
}

/**
 * Displays a trending icon indicating price trend direction.
 * Green with downward trend for falling prices (good for consumers).
 * Red with upward trend for rising prices (warning).
 */
export function PriceTrendIcon({ trend, className = '' }: PriceTrendIconProps) {
  if (!trend) return null;

  const isFalling = trend === 'falling';
  
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className={`h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 flex items-center justify-center rounded-full border-2 backdrop-blur-sm transition-all duration-300 cursor-default hover:scale-110 bg-background/80 border-white/60 ${className}`}
          >
            {isFalling ? (
              <TrendingDown className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-green-500" strokeWidth={2.5} />
            ) : (
              <TrendingUp className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-red-500" strokeWidth={2.5} />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent 
          side="left" 
          sideOffset={8}
          className={`text-xs font-medium z-[9999] pointer-events-none ${
            isFalling 
              ? 'bg-green-500/90 text-white border-green-400' 
              : 'bg-red-500/90 text-white border-red-400'
          }`}
          style={{ position: 'fixed' }}
        >
          {isFalling 
            ? 'Price is on a downward trend — good time to buy!' 
            : 'Price is on an upward trend — consider acting soon'}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
