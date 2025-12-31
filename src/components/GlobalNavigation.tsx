import { NavigationDrawer } from './NavigationDrawer';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function GlobalNavigation() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLoginClick = () => {
    if (user) {
      navigate('/favorites');
    } else {
      navigate('/auth');
    }
  };

  return (
    <>
      <div className="fixed top-[105px] left-6 z-[100] md:top-[115px]">
        <NavigationDrawer />
      </div>
      <div className="fixed top-[105px] right-6 z-[100] md:top-[115px]">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleLoginClick}
          className="text-foreground hover:bg-white/20 p-2.5 border border-white/40 rounded-lg bg-background/30 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <User className="h-5 w-5" />
        </Button>
      </div>
    </>
  );
}
