import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Order {
    id: string;
    created_at: string;
    total_amount: number;
    status: string;
    full_name: string | null;
    phone: string | null;
    address: string | null;
    items: any;
}

const AdminOrders = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            // Create a timeout promise to prevent hanging
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Connection timed out')), 5000)
            );

            const fetchPromise = supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });

            const result = await Promise.race([fetchPromise, timeoutPromise]) as any;

            if (result.error) throw result.error;
            setOrders(result.data || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error('فشل تحميل الطلبات (تأكد من جدول orders)');
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: string, status: string) => {
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status })
                .eq('id', id);

            if (error) throw error;

            setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
            toast.success('تم تحديث حالة الطلب');
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('فشل تحديث الحالة');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'shipped': return 'bg-blue-100 text-blue-800';
            case 'delivered': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pending': return 'قيد الانتظار';
            case 'shipped': return 'تم الشحن';
            case 'delivered': return 'تم التوصيل';
            case 'cancelled': return 'ملغى';
            default: return status;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">الطلبات</h1>
                <span className="text-sm text-gray-500">{orders.length} طلب</span>
            </div>

            <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50/50">
                            <TableHead className="text-right">رقم الطلب</TableHead>
                            <TableHead className="text-right">العميل</TableHead>
                            <TableHead className="text-right">المنتجات</TableHead>
                            <TableHead className="text-right">السعر الإجمالي</TableHead>
                            <TableHead className="text-right">التاريخ</TableHead>
                            <TableHead className="text-right">الحالة</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                                    لا توجد طلبات حتى الآن
                                </TableCell>
                            </TableRow>
                        ) : (
                            orders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-mono text-xs">{order.id.slice(0, 8)}</TableCell>
                                    <TableCell>
                                        <div className="font-medium">{order.full_name || 'غير معروف'}</div>
                                        <div className="text-xs text-gray-500">{order.phone}</div>
                                        <div className="text-xs text-gray-500 truncate max-w-[150px]" title={order.address || ''}>
                                            {order.address}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm text-gray-600">
                                            {Array.isArray(order.items) ? (
                                                <div className="space-y-1">
                                                    {order.items.slice(0, 2).map((item: any, idx: number) => (
                                                        <div key={idx} className="flex items-center gap-1 text-xs">
                                                            <span className="font-medium">{item.quantity}x</span>
                                                            <span className="truncate max-w-[100px]">{item.name}</span>
                                                        </div>
                                                    ))}
                                                    {order.items.length > 2 && (
                                                        <div className="text-xs text-gray-400">+{order.items.length - 2} المزيد</div>
                                                    )}
                                                </div>
                                            ) : (
                                                '--'
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-bold">{order.total_amount.toLocaleString()} دج</TableCell>
                                    <TableCell className="text-sm text-gray-500">
                                        {format(new Date(order.created_at), 'dd MMM yyyy', { locale: ar })}
                                    </TableCell>
                                    <TableCell>
                                        <Select
                                            defaultValue={order.status}
                                            onValueChange={(val) => updateStatus(order.id, val)}
                                        >
                                            <SelectTrigger className={`w-[130px] h-8 text-xs border-0 ${getStatusColor(order.status || 'pending')}`}>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent dir="rtl">
                                                <SelectItem value="pending">قيد الانتظار</SelectItem>
                                                <SelectItem value="shipped">تم الشحن</SelectItem>
                                                <SelectItem value="delivered">تم التوصيل</SelectItem>
                                                <SelectItem value="cancelled">ملغى</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default AdminOrders;
