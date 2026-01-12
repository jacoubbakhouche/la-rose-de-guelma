import { Toaster } from "@/components/ui/toaster";
import { useEffect } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { AuthProvider } from "@/context/AuthContext";
import Index from "./pages/Index";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Addresses from "./pages/Addresses";
import Favorites from "./pages/Favorites";
import MyOrders from "./pages/MyOrders";
import Search from "./pages/Search";
import AdminProducts from "./pages/AdminProducts";
import AdminOrders from "./pages/AdminOrders";
import AdminDesign from "./pages/AdminDesign";
import AdminLayout from "./components/AdminLayout";
import NotFound from "./pages/NotFound";

import { playClickSound } from "@/utils/sound";

const queryClient = new QueryClient();

const App = () => {
  // Global Click Sound
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Play sound only for interactive elements (buttons, links, inputs) or their children
      const target = e.target as HTMLElement;
      const clickable = target.closest('button, a, input, [role="button"]');
      if (clickable) {
        playClickSound();
      }
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <FavoritesProvider>
          <CartProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/favorites" element={<Favorites />} />
                  <Route path="/orders" element={<MyOrders />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/addresses" element={<Addresses />} />
                  <Route path="/addresses" element={<Addresses />} />

                  {/* Admin Routes */}
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="design" element={<AdminDesign />} />
                  </Route>
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </CartProvider>
        </FavoritesProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;