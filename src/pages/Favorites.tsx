import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Heart, Loader2, Trash2, ExternalLink, Bell, BellOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function Favorites() {
  const { user, loading: authLoading } = useAuth();
  const { favorites, loading: favoritesLoading, removeFavorite } = useFavorites();
  const navigate = useNavigate();
  const [alertsEnabled, setAlertsEnabled] = useState<boolean>(true);
  const [loadingAlerts, setLoadingAlerts] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string>('');

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Fetch user's alert preference
  useEffect(() => {
    async function fetchAlertPreference() {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('price_alerts_enabled')
        .eq('id', user.id)
        .single();

      if (!error && data) {
        setAlertsEnabled(data.price_alerts_enabled ?? true);
      }
      setLoadingAlerts(false);
    }

    fetchAlertPreference();
  }, [user]);

  // Clear status message after 3 seconds
  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  // Toggle price alerts
  async function togglePriceAlerts() {
    if (!user?.id) return;

    setLoadingAlerts(true);
    const newValue = !alertsEnabled;

    const { error } = await supabase
      .from('profiles')
      .update({ price_alerts_enabled: newValue })
      .eq('id', user.id);

    if (error) {
      setStatusMessage('Failed to update alert settings');
      setLoadingAlerts(false);
      return;
    }

    setAlertsEnabled(newValue);
    setLoadingAlerts(false);
    setStatusMessage(
      newValue 
        ? '✓ Price alerts enabled' 
        : '✓ Price alerts disabled'
    );
  }

  if (authLoading || favoritesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary fill-primary" />
            <h1 className="text-lg font-semibold">My Favorites</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Price Alerts Toggle Card */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {alertsEnabled ? (
                  <Bell className="h-5 w-5 text-primary" />
                ) : (
                  <BellOff className="h-5 w-5 text-muted-foreground" />
                )}
                <div>
                  <h3 className="font-medium text-sm">Price Drop Alerts</h3>
                  <p className="text-xs text-muted-foreground">
                    Get notified when your favorites drop in price
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {statusMessage && (
                  <span className="text-xs text-green-600 font-medium">
                    {statusMessage}
                  </span>
                )}
                <Button
                  variant={alertsEnabled ? "default" : "outline"}
                  size="sm"
                  onClick={togglePriceAlerts}
                  disabled={loadingAlerts}
                >
                  {loadingAlerts ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : alertsEnabled ? (
                    'Enabled'
                  ) : (
                    'Disabled'
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {favorites.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <Heart className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-medium mb-2">No favorites yet</h2>
            <p className="text-muted-foreground mb-6">
              Browse products and tap the heart icon to save them here
            </p>
            <Button onClick={() => navigate('/')}>
              Browse Products
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {favorites.map((favorite) => (
              <Card key={favorite.id} className="overflow-hidden group">
                <div className="relative aspect-square bg-white">
                  {favorite.product_image ? (
                    <img
                      src={favorite.product_image}
                      alt={favorite.product_title || 'Product'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <Heart className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  
                  {/* Remove button */}
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeFavorite(favorite.product_url)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <CardContent className="p-3">
                  <h3 className="font-medium text-sm line-clamp-2 mb-2">
                    {favorite.product_title || 'Product'}
                  </h3>
                  <a
                    href={favorite.product_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    View Product
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
