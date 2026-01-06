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
        <div className="flex flex-col h-full bg-white/60 backdrop-blur-xl">
            <div className="p-8 border-b border-gray-100/50">
                <h1 className="text-2xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">لوحة التحكم</h1>
                <p className="text-sm font-medium text-gray-500 mt-2">Laroze de Guelma</p>
            </div>

            <nav className="flex-1 px-6 py-8 space-y-4">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = location.pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            to={link.href}
                            onClick={() => setOpen(false)}
                            className={cn(
                                "flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group relative overflow-hidden",
                                isActive
                                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-200 transform scale-105"
                                    : "bg-transparent text-gray-600 hover:bg-white/60 hover:shadow-sm hover:-translate-y-0.5"
                            )}
                        >
                            <Icon className={cn("w-6 h-6 transition-transform group-hover:scale-110", isActive ? "text-white" : "text-gray-400 group-hover:text-purple-600")} />
                            <span className="font-bold">{link.label}</span>
                            {isActive && <div className="absolute inset-0 bg-white/10" />}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-6 border-t border-gray-100/50">
                <Button
                    variant="ghost"
                    className="w-full h-14 justify-start gap-4 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-2xl text-lg font-bold"
                    onClick={() => signOut()}
                >
                    <LogOut className="w-6 h-6" />
                    <span>تسجيل الخروج</span>
                </Button>
            </div>
        </div >
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
            <aside className="w-72 hidden md:flex flex-col fixed inset-y-0 right-0 z-50 bg-white/60 backdrop-blur-xl border-l border-white/20 shadow-2xl transition-all duration-300">
                <div className="p-8 border-b border-gray-100/50">
                    <h1 className="text-2xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">لوحة التحكم</h1>
                    <p className="text-sm font-medium text-gray-500 mt-2">Laroze de Guelma</p>
                </div>

                <nav className="flex-1 px-6 py-8 space-y-4">
                    {links.map((link) => {
                        const Icon = link.icon;
                        const isActive = location.pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                to={link.href}
                                className={cn(
                                    "flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group relative overflow-hidden",
                                    isActive
                                        ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-200 transform scale-105"
                                        : "bg-transparent text-gray-600 hover:bg-white/60 hover:shadow-sm hover:-translate-y-0.5"
                                )}
                            >
                                <Icon className={cn("w-6 h-6 transition-transform group-hover:scale-110", isActive ? "text-white" : "text-gray-400 group-hover:text-purple-600")} />
                                <span className="font-bold">{link.label}</span>
                                {isActive && <div className="absolute inset-0 bg-white/10" />}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-6 border-t border-gray-100/50">
                    <Button
                        variant="ghost"
                        className="w-full h-14 justify-start gap-4 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-2xl text-lg font-bold"
                        onClick={() => signOut()}
                    >
                        <LogOut className="w-6 h-6" />
                        <span>تسجيل الخروج</span>
                    </Button>
                </div>
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
