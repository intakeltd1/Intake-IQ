import { useComparison } from '@/hooks/useComparison';
import { SignUpPromptModal } from './SignUpPromptModal';

interface SignUpPromptWrapperProps {
  hasSearchCriteria: boolean;
}

export function SignUpPromptWrapper({ hasSearchCriteria }: SignUpPromptWrapperProps) {
  const { comparisonProducts } = useComparison();
  
  return (
    <SignUpPromptModal 
      triggerOnComparisonCount={comparisonProducts.length}
      triggerOnSearch={hasSearchCriteria}
    />
  );
}
