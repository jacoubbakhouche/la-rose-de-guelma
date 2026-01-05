import { Home, Search, Heart, User, ShoppingBag } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '@/context/CartContext';

const navItems = [
  { icon: Home, label: 'الرئيسية', path: '/' },
  { icon: Search, label: 'بحث', path: '/search' },
  { icon: Heart, label: 'المفضلة', path: '/favorites' },
  { icon: ShoppingBag, label: 'السلة', path: '/cart' },
  { icon: User, label: 'حسابي', path: '/profile' },
];

const BottomNav = () => {
  const location = useLocation();
  const { cartCount } = useCart();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/50 md:hidden">
      <div className="flex items-center justify-around h-20 pb-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className="relative flex flex-col items-center justify-center -mt-4 transition-transform hover:-translate-y-1"
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={`w-12 h-12 flex items-center justify-center rounded-full shadow-[0_8px_20px_rgba(0,0,0,0.06)] border border-white/50 backdrop-blur-sm ${isActive
                    ? 'bg-primary text-primary-foreground shadow-[0_8px_25px_rgba(124,58,237,0.25)]'
                    : 'bg-white text-gray-400'
                  }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {item.path === '/cart' && cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                      {cartCount}
                    </span>
                  )}
                </div>
              </motion.div>
              {/* Optional: Label below the bubble if user wants, but for "cloud buttons" usually icons are enough. keeping label small for now */}
              <span className={`text-[10px] font-medium mt-1 ${isActive ? 'text-primary' : 'text-gray-400'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;