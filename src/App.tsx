import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { FavoritesProvider } from "@/hooks/useFavorites";
import { GlobalNavigation } from "@/components/GlobalNavigation";

import LandingPage from "./pages/LandingPage";
import Index from "./pages/Index";
import Electrolytes from "./pages/Electrolytes";
import Auth from "./pages/Auth";
import Favorites from "./pages/Favorites";
import NotFound from "./pages/NotFound";
import Blog from '@/pages/Blog';
import BlogPost from '@/pages/BlogPost';

const queryClient = new QueryClient();

/* ✅ Layout with Nav */
const AppLayout = () => (
  <>
    <GlobalNavigation />
    <Outlet />
  </>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <FavoritesProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* ROUTES WITH NAV */}
              <Route element={<AppLayout />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/protein" element={<Index />} />
                <Route path="/electrolytes" element={<Electrolytes />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/favorites" element={<Favorites />} />
              </Route>

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </FavoritesProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
