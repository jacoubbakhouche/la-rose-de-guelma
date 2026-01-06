import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { ShoppingBag, Package, LogOut, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const AdminLayout = () => {
    const { isAdmin, loading, signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!loading && !isAdmin) {
            navigate('/');
        }
    }, [isAdmin, loading, navigate]);

    if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

    if (!isAdmin) return null;

    const links = [
        { href: '/admin/orders', label: 'الطلبات', icon: ShoppingBag },
        { href: '/admin/products', label: 'المنتجات', icon: Package },
    ];

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            <div className="p-6 border-b border-gray-100">
                <h1 className="text-xl font-bold text-primary">لوحة التحكم</h1>
                <p className="text-sm text-gray-500 mt-1">Laroze de Guelma</p>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = location.pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            to={link.href}
                            onClick={() => setOpen(false)}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                                isActive
                                    ? "bg-primary/10 text-primary font-medium"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-primary"
                            )}
                        >
                            <Icon className="w-5 h-5" />
                            <span>{link.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-gray-100 mt-auto">
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => signOut()}
                >
                    <LogOut className="w-5 h-5" />
                    <span>تسجيل الخروج</span>
                </Button>
            </div>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-gray-50" dir="rtl">
            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50 px-4 flex items-center justify-between">
                <div className="font-bold text-primary">لوحة التحكم</div>
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Menu className="w-6 h-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="p-0 bg-white">
                        <SidebarContent />
                    </SheetContent>
                </Sheet>
            </div>

            {/* Desktop Sidebar */}
            <aside className="w-64 bg-white border-l border-gray-200 hidden md:flex flex-col fixed inset-y-0 right-0 z-50">
                <SidebarContent />
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:mr-64 p-4 md:p-8 pt-20 md:pt-8 transition-all duration-200">
                <div className="max-w-5xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
