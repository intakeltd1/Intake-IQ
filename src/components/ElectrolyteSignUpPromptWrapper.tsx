import { useElectrolyteComparison } from '@/hooks/useElectrolyteComparison';
import { SignUpPromptModal } from './SignUpPromptModal';

interface ElectrolyteSignUpPromptWrapperProps {
  hasSearchCriteria: boolean;
}

export function ElectrolyteSignUpPromptWrapper({ hasSearchCriteria }: ElectrolyteSignUpPromptWrapperProps) {
  const { comparisonProducts } = useElectrolyteComparison();
  
  return (
    <SignUpPromptModal 
      triggerOnComparisonCount={comparisonProducts.length}
      triggerOnSearch={hasSearchCriteria}
    />
  );
}
