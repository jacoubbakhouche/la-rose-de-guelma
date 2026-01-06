import { Search, ShoppingBag, User, LogOut, Menu, Heart, Package } from 'lucide-react';
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
    <div className="flex flex-col gap-6 mt-8">
      {/* User Info / Profile Link */}
      {user ? (
        <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-2xl">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm text-foreground truncate">{user.email}</p>
            <Link to="/profile" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              عرض الملف الشخصي
            </Link>
          </div>
        </div>
      ) : (
        <Link to="/auth" className="flex items-center gap-3 p-4 bg-secondary/50 rounded-2xl">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="font-medium text-sm">زائر</p>
            <p className="text-xs text-muted-foreground">سجل الدخول للمزيد</p>
          </div>
        </Link>
      )}

      <div className="space-y-2">
        {isAdmin && (
          <Link to="/admin/orders" className="flex items-center gap-4 p-4 hover:bg-purple-50 rounded-xl transition-colors group mb-2 border border-purple-100 bg-purple-50/50">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
              <Package className="w-5 h-5 text-purple-600" />
            </div>
            <span className="font-bold text-purple-700">لوحة المشرف</span>
          </Link>
        )}
        <Link to="/favorites" className="flex items-center gap-4 p-4 hover:bg-secondary rounded-xl transition-colors group">
          <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center group-hover:bg-pink-100 transition-colors">
            <Heart className="w-5 h-5 text-pink-500" />
          </div>
          <span className="font-medium">المفضلة</span>
        </Link>

        <Link to="/profile" className="flex items-center gap-4 p-4 hover:bg-secondary rounded-xl transition-colors group">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
            <User className="w-5 h-5 text-blue-500" />
          </div>
          <span className="font-medium">حسابي</span>
        </Link>

        {user ? (
          <button onClick={handleSignOut} className="w-full flex items-center gap-4 p-4 hover:bg-red-50 rounded-xl transition-colors group text-red-600">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors">
              <LogOut className="w-5 h-5" />
            </div>
            <span className="font-medium">تسجيل الخروج</span>
          </button>
        ) : (
          <Link to="/auth" className="flex items-center gap-4 p-4 hover:bg-secondary rounded-xl transition-colors group">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <User className="w-5 h-5 text-primary" />
            </div>
            <span className="font-medium">تسجيل الدخول</span>
          </Link>
        )}
      </div>
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
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
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