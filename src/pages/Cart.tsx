import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Trash2, Plus, Minus, MoreHorizontal, ShoppingBag, MapPin, ChevronRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

interface Address {
  id: string;
  full_name: string;
  address_line1: string;
  wilaya: string;
  commune: string;
  phone: string;
  is_default: boolean;
}

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, cartTotal, loading } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [loadingAddress, setLoadingAddress] = useState(false);

  useEffect(() => {
    if (user && cartItems.length > 0) {
      fetchDefaultAddress();
    }
  }, [user, cartItems]);

  const fetchDefaultAddress = async () => {
    try {
      setLoadingAddress(true);
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user?.id)
        .order('is_default', { ascending: false })
        .limit(1)
        .single();

      if (!error && data) {
        setSelectedAddress(data);
      }
    } catch (error) {
      // Is okay if no address found
    } finally {
      setLoadingAddress(false);
    }
  };

  // Mock Shipping Prices (To be replaced with real data from user)
  const getShippingPrice = (wilaya: string, type: 'home' | 'desk') => {
    // Default prices
    const basePrice = 600;
    const deskDiscount = 200;

    // Example logic:
    if (type === 'desk') return Math.max(0, basePrice - deskDiscount);
    return basePrice;
  };

  const [deliveryType, setDeliveryType] = useState<'home' | 'desk'>('home');
  const shippingPrice = selectedAddress ? getShippingPrice(selectedAddress.wilaya, deliveryType) : 0;
  const finalTotal = cartTotal + shippingPrice;

  const handleCheckout = async () => {
    if (!user) {
      toast.error('يرجى تسجيل الدخول أولاً');
      navigate('/auth');
      return;
    }
    if (!selectedAddress) {
      toast.error('يرجى إضافة عنوان توصيل');
      navigate('/addresses');
      return;
    }

    // Construct Order Payload
    const orderPayload = {
      user_id: user.id,
      full_name: selectedAddress.full_name,
      phone: selectedAddress.phone,
      address: `${selectedAddress.address_line1}, ${selectedAddress.commune}, ${selectedAddress.wilaya}`,
      items: cartItems as any,
      total_amount: finalTotal,
      status: 'pending' // Default status
    };

    const toastId = toast.loading('جاري إرسال الطلب...');

    try {
      const { error } = await supabase.from('orders').insert(orderPayload);

      if (error) throw error;

      toast.success('تم استلام طلبك بنجاح!', { id: toastId });
      clearCart();
      navigate('/');
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('فشل في إرسال الطلب. حاول مرة أخرى.', { id: toastId });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-40 md:pb-8">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-4">
            <Link to="/">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-full hover:bg-secondary transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-foreground" />
              </motion.button>
            </Link>
            <h1 className="text-xl font-bold text-foreground">السلة</h1>
          </div>
          <div className="flex items-center gap-2">
            {cartItems.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={clearCart}
                className="flex items-center gap-1 text-destructive text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>مسح الكل</span>
              </motion.button>
            )}
            <button className="p-2 rounded-full hover:bg-secondary transition-colors">
              <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>
      </header>

      {/* Cart Items */}
      <div className="container px-4 py-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 bg-card rounded-2xl p-4 shadow-card">
                <Skeleton className="w-24 h-24 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex justify-between items-center pt-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : cartItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">سلتك فارغة</h2>
            <p className="text-muted-foreground mb-6">ابدأ التسوق الآن وأضف منتجاتك المفضلة</p>
            <Link to="/">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-semibold"
              >
                تسوق الآن
              </motion.button>
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {cartItems.map((item, index) => {
                const itemPrice = item.discount
                  ? item.price * (1 - item.discount / 100)
                  : item.price;

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex gap-4 bg-card rounded-2xl p-4 shadow-card"
                  >
                    {/* Image */}
                    <div className="w-24 h-24 bg-secondary rounded-xl overflow-hidden flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-contain p-2"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">{item.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {item.selectedColor && (
                            <span>اللون: {item.selectedColor}</span>
                          )}
                          {item.selectedSize && (
                            <span>المقاس: {item.selectedSize}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground">
                          {Math.round(itemPrice).toLocaleString()} دج
                        </span>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center"
                          >
                            <Minus className="w-4 h-4 text-foreground" />
                          </motion.button>
                          <span className="w-8 text-center font-medium text-foreground">
                            {item.quantity}
                          </span>
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center"
                          >
                            <Plus className="w-4 h-4 text-foreground" />
                          </motion.button>
                        </div>
                      </div>
                    </div>

                    {/* Delete */}
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => removeFromCart(item.id)}
                      className="self-start p-2 rounded-lg hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="w-5 h-5 text-destructive" />
                    </motion.button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Checkout Section & Address Preview */}
      {cartItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-0 left-0 right-0 glass border-t border-border/50 p-6 rounded-t-[2rem] space-y-4 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]"
        >
          {/* Address Selector Preview */}
          {user ? (
            <div className="space-y-3">
              <Link to="/addresses" className="block">
                <div className="bg-secondary/50 p-3 rounded-2xl flex items-center gap-3 hover:bg-secondary transition-colors cursor-pointer border border-border/50">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    {selectedAddress ? (
                      <>
                        <p className="font-bold text-sm text-foreground">{selectedAddress.full_name}</p>
                        <p className="text-xs text-muted-foreground truncate">{selectedAddress.wilaya}, {selectedAddress.commune}</p>
                      </>
                    ) : (
                      <p className="font-medium text-sm text-foreground">إضافة عنوان توصيل</p>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </Link>

              {/* Delivery Type Selector */}
              {selectedAddress && (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setDeliveryType('home')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${deliveryType === 'home'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border bg-card text-muted-foreground'
                      }`}
                  >
                    <span className="text-xs font-bold">توصيل للمنزل</span>
                    <span className="text-[10px]">{getShippingPrice(selectedAddress.wilaya, 'home')} دج</span>
                  </button>
                  <button
                    onClick={() => setDeliveryType('desk')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${deliveryType === 'desk'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border bg-card text-muted-foreground'
                      }`}
                  >
                    <span className="text-xs font-bold">استلام من المكتب</span>
                    <span className="text-[10px]">{getShippingPrice(selectedAddress.wilaya, 'desk')} دج</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/auth" className="block text-center text-sm text-primary underline mb-2">
              سجل الدخول لإتمام الطلب
            </Link>
          )}

          <div className="space-y-1 py-2 border-t border-dashed border-border">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">المشتريات:</span>
              <span className="font-medium">{Math.round(cartTotal).toLocaleString()} دج</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">التوصيل:</span>
              <span className="font-medium text-primary">{shippingPrice.toLocaleString()} دج</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <span className="text-muted-foreground font-bold">الإجمالي:</span>
            <span className="text-2xl font-bold text-foreground">
              {Math.round(finalTotal).toLocaleString()} دج
            </span>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCheckout}
            className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-semibold shadow-soft text-lg"
          >
            تأكيد الطلب
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};

export default Cart;