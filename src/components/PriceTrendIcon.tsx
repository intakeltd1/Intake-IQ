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
            className={`h-8 w-8 flex items-center justify-center rounded-full border-2 backdrop-blur-sm transition-all duration-300 cursor-default hover:scale-110 ${
              isFalling 
                ? 'border-green-500 bg-green-500/20' 
                : 'border-red-500 bg-red-500/20'
            } ${className}`}
          >
            {isFalling ? (
              <TrendingDown className="h-4 w-4 text-green-500" strokeWidth={2.5} />
            ) : (
              <TrendingUp className="h-4 w-4 text-red-500" strokeWidth={2.5} />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          className={`text-xs font-medium ${
            isFalling 
              ? 'bg-green-500/90 text-white border-green-400' 
              : 'bg-red-500/90 text-white border-red-400'
          }`}
        >
          {isFalling 
            ? 'Price is on a downward trend — good time to buy!' 
            : 'Price is on an upward trend — consider acting soon'}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
