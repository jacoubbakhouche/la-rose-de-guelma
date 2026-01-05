import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Trash2, Plus, Minus, MoreHorizontal, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import BottomNav from '@/components/BottomNav';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart();

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
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
        {cartItems.length === 0 ? (
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

      {/* Checkout Section */}
      {cartItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-20 md:bottom-0 left-0 right-0 glass border-t border-border/50 p-4"
        >
          <div className="container flex items-center justify-between mb-4">
            <span className="text-muted-foreground">المجموع:</span>
            <span className="text-2xl font-bold text-foreground">
              {Math.round(cartTotal).toLocaleString()} دج
            </span>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-semibold shadow-soft"
          >
            إتمام الطلب
          </motion.button>
        </motion.div>
      )}

      <BottomNav />
    </div>
  );
};

export default Cart;