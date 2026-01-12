import { Search, ShoppingBag, User, LogOut, Menu, Heart, Package, Home, ChevronLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { toast } from 'sonner';

const Header = () => {
  const { cartCount } = useCart();
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast.success('تم تسجيل الخروج بنجاح');
    navigate('/');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full py-4">
      {/* User Section */}
      <div className="mb-6 px-2">
        {user ? (
          <div className="relative overflow-hidden rounded-3xl p-5 bg-gradient-to-br from-primary to-purple-700 text-white shadow-lg border border-white/10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                <User className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="font-bold text-lg truncate">{user.email?.split('@')[0]}</p>
                <Link to="/profile" className="text-xs text-white/80 hover:text-white flex items-center gap-1 mt-1 transition-colors">
                  <span>عرض الملف</span>
                  <ChevronLeft className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <Link to="/auth">
            <div className="relative overflow-hidden rounded-3xl p-5 bg-gradient-to-br from-gray-900 to-gray-800 text-white shadow-lg border border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold">زائر</p>
                  <p className="text-xs text-gray-300">سجل الدخول للمزيد</p>
                </div>
              </div>
            </div>
          </Link>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 space-y-2 px-2">
        <Link to="/" className="flex items-center gap-4 p-4 rounded-2xl hover:bg-secondary/80 transition-all group border border-transparent hover:border-border/50">
          <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
            <Home className="w-5 h-5 text-primary" />
          </div>
          <span className="font-medium text-lg text-foreground">الرئيسية</span>
        </Link>

        <Link to="/orders" className="flex items-center gap-4 p-4 rounded-2xl hover:bg-secondary/80 transition-all group border border-transparent hover:border-border/50">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
            <Package className="w-5 h-5 text-indigo-500" />
          </div>
          <span className="font-medium text-lg text-foreground">طلباتي</span>
        </Link>
        <Link to="/favorites" className="flex items-center gap-4 p-4 rounded-2xl hover:bg-secondary/80 transition-all group border border-transparent hover:border-border/50">
          <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center group-hover:bg-pink-100 transition-colors">
            <Heart className="w-5 h-5 text-pink-500" />
          </div>
          <span className="font-medium text-lg text-foreground">المفضلة</span>
        </Link>

        {user && (
          <Link to="/profile" className="flex items-center gap-4 p-4 rounded-2xl hover:bg-secondary/80 transition-all group border border-transparent hover:border-border/50">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
              <User className="w-5 h-5 text-blue-500" />
            </div>
            <span className="font-medium text-lg text-foreground">حسابي</span>
          </Link>
        )}

        {isAdmin && (
          <Link to="/admin/orders" className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 group mt-4 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Package className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <p className="font-bold text-amber-900">لوحة التحكم</p>
              <p className="text-xs text-amber-700">إدارة المتجر</p>
            </div>
          </Link>
        )}
      </div>

      {/* Logout */}
      {user && (
        <div className="px-2 mt-4 pb-4">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors font-medium border border-red-100"
          >
            <LogOut className="w-5 h-5" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      )}
    </div>
  );

  return (
    <header className="sticky top-0 z-50 glass border-b border-border/50">
      <div className="container flex items-center justify-between h-16 px-4">

        {/* Left Side: Logo & Mobile Menu */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xl font-bold tracking-tight text-foreground hidden md:block"
            >
              LAROZE
            </motion.h1>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xl font-bold tracking-tight text-foreground md:hidden"
            >
              LAROZE
            </motion.h1>
          </Link>
        </div>

        {/* Right Side: Actions */}
        <div className="flex items-center gap-2">
          {/* Hamburger Menu - Visible on Mobile */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Menu className="w-6 h-6 text-foreground" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[320px] sm:w-[400px] border-l-0 rounded-l-[2rem] bg-background/95 backdrop-blur-xl">
                <SheetHeader className="text-right">
                  <SheetTitle>القائمة</SheetTitle>
                </SheetHeader>
                <SidebarContent />
              </SheetContent>
            </Sheet>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-full hover:bg-secondary transition-colors"
          >
            <Search className="w-5 h-5 text-muted-foreground" />
          </motion.button>

          <Link to="/cart">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-2 rounded-full hover:bg-secondary transition-colors"
            >
              <ShoppingBag className="w-5 h-5 text-muted-foreground" />
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs font-semibold rounded-full flex items-center justify-center"
                >
                  {cartCount}
                </motion.span>
              )}
            </motion.div>
          </Link>

          {/* Desktop User Menu (Keep for Desktop only if desired, or hide) */}
          <div className="hidden md:block">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="w-5 h-5 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem className="flex items-center gap-2 text-right flex-row-reverse">
                    <User className="w-4 h-4" />
                    <span className="truncate">{user.email}</span>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin/orders" className="flex items-center gap-2 w-full text-purple-600 font-bold flex-row-reverse justify-between">
                        <span>لوحة المشرف</span>
                        <Package className="w-4 h-4" />
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="text-right flex-row-reverse gap-2 text-destructive focus:text-destructive"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>تسجيل الخروج</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button variant="default" size="sm" className="text-sm">
                  تسجيل الدخول
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header >
  );
};

export default Header;