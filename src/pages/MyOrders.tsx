import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Package, Clock, ShoppingBag } from 'lucide-react';
import Header from '@/components/Header';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Order {
    id: string;
    created_at: string;
    status: string;
    total_amount: number;
    items: any[];
}

const MyOrders = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchOrders();
        }
    }, [user]);

    const fetchOrders = async () => {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('user_id', user?.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(data || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = async (orderId: string) => {
        if (!window.confirm('هل أنت متأكد من إلغاء هذا الطلب؟')) return;

        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: 'cancelled' })
                .eq('id', orderId);

            if (error) throw error;

            toast.success('تم إلغاء الطلب بنجاح');
            fetchOrders();
        } catch (error) {
            console.error('Error cancelling order:', error);
            toast.error('حدث خطأ أثناء إلغاء الطلب');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            case 'processing': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'delivered': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20';
            default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'pending': return 'قيد الانتظار';
            case 'processing': return 'جاري التجهيز';
            case 'delivered': return 'تم التوصيل';
            case 'cancelled': return 'ملغي';
            default: return status;
        }
    };

    if (!user) return (
        <div className="min-h-screen bg-background pb-20">
            <Header />
            <div className="p-8 text-center text-muted-foreground mt-20">
                يرجى تسجيل الدخول لعرض طلباتك.
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-background pb-20 md:pb-8">
            <Header />
            <main className="container px-4 py-8">
                <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Package className="w-6 h-6 text-primary" />
                    طلباتي
                </h1>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 w-full rounded-2xl" />)}
                    </div>
                ) : orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mb-4">
                            <ShoppingBag className="w-10 h-10 text-muted-foreground" />
                        </div>
                        <h2 className="text-xl font-semibold mb-2">لا توجد طلبات سابقة</h2>
                        <p className="text-muted-foreground">لم تقم بأي عملية شراء بعد</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div key={order.id} className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="font-bold text-lg">طلب #{order.id.slice(0, 8)}</p>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                            <Clock className="w-3 h-3" />
                                            <span>{format(new Date(order.created_at), 'PPP p', { locale: ar })}</span>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                                        {getStatusText(order.status)}
                                    </span>
                                </div>

                                <div className="space-y-3 mb-4 bg-secondary/30 p-3 rounded-xl">
                                    {Array.isArray(order.items) && order.items.slice(0, 2).map((item: any, idx) => (
                                        <div key={idx} className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-white rounded-lg overflow-hidden flex-shrink-0 border border-border/50">
                                                {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {item.quantity} x {item.price} دج
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    {Array.isArray(order.items) && order.items.length > 2 && (
                                        <p className="text-xs text-muted-foreground text-center font-medium">
                                            +{order.items.length - 2} منتجات أخرى
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <div>
                                        <p className="text-xs text-muted-foreground">الإجمالي</p>
                                        <p className="font-bold text-lg text-primary">{Math.round(order.total_amount).toLocaleString()} دج</p>
                                    </div>

                                    {order.status === 'pending' && (
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleCancelOrder(order.id)}
                                            className="h-8 rounded-xl px-4 font-bold"
                                        >
                                            إلغاء الطلب
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default MyOrders;
