import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  discount?: number;
  rating?: number;
  reviews?: number;
  sizes?: string[];
  colors?: string[];
  is_new?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, size?: string, color?: string) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  cartTotal: number;
  cartCount: number;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchCart();
    } else {
      setCartItems([]); // Or load from localStorage if we wanted guest cart
      setLoading(false);
    }
  }, [userId]);

  const fetchCart = async () => {
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select('*, product:products(*)'); // Join with products

      if (error) throw error;

      const items: CartItem[] = (data || [])
        .filter((item: any) => item.product)
        .map((item: any) => ({
          ...item.product,
          quantity: item.quantity,
          selectedSize: item.size,
          selectedColor: item.color,
        }));
      setCartItems(items);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product: Product, size?: string, color?: string) => {
    // Optimistic Update
    setCartItems((prev) => {
      const existing = prev.find(p => p.id === product.id);
      if (existing) {
        return prev.map(p => p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p);
      }
      return [...prev, { ...product, quantity: 1, selectedSize: size, selectedColor: color }];
    });

    if (!userId) return; // Guest: Just local state (simplified for now)

    try {
      // Check if item exists in DB
      const { data: existing } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', userId)
        .eq('product_id', product.id)
        .single();

      if (existing) {
        await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + 1 })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('cart_items')
          .insert({
            user_id: userId,
            product_id: product.id,
            quantity: 1,
            // We haven't added size/color columns to the cart_items SQL plan yet
            // But user didn't explicitly ask for them in SQL, but logic needs them.
            // For now, I'll omit saving size/color to DB explicitly unless I alter table.
            // I will add them to the SQL plan or just ignore saving them to DB for now to avoid errors.
            // Wait, user wants "add to cart saves to DB". I should stick to the SQL user ran.
            // The SQL was: product_id, quantity. No size/color columns.
            // So I will only save product_id and quantity to DB.
          });
      }
    } catch (e) {
      console.error("Error syncing cart:", e);
    }
  };

  const removeFromCart = async (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));

    if (!userId) return;

    await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );

    if (!userId) return;

    await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('user_id', userId)
      .eq('product_id', productId);
  };

  const clearCart = async () => {
    setCartItems([]);
    if (!userId) return;
    await supabase.from('cart_items').delete().eq('user_id', userId);
  };

  const cartTotal = cartItems.reduce((total, item) => {
    const price = item.discount ? item.price * (1 - item.discount / 100) : item.price;
    return total + price * item.quantity;
  }, 0);

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
        loading
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};