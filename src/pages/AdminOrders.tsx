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
import { Loader2, Search, ImageIcon, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

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
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            console.log('Orders fetched:', data?.length);
            setOrders(data || []);
        } catch (error: any) {
            console.error('Error fetching orders:', error);
            toast.error('فشل في تحميل الطلبات: ' + (error.message || 'خطأ غير معروف'));
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

    const deleteOrder = async (id: string) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا الطلب نهائياً؟')) return;

        try {
            const { error } = await supabase
                .from('orders')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setOrders(orders.filter(o => o.id !== id));
            toast.success('تم حذف الطلب بنجاح');
        } catch (error) {
            console.error('Error deleting order:', error);
            toast.error('فشل حذف الطلب');
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

    const filteredOrders = orders.filter(order => {
        const search = searchTerm.toLowerCase();
        return (
            order.id.toLowerCase().includes(search) ||
            order.full_name?.toLowerCase().includes(search) ||
            order.phone?.includes(search) ||
            order.address?.toLowerCase().includes(search)
        );
    });

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-4 w-16" />
                </div>
                <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50/50">
                                <TableHead className="text-right"><Skeleton className="h-4 w-16" /></TableHead>
                                <TableHead className="text-right"><Skeleton className="h-4 w-24" /></TableHead>
                                <TableHead className="text-right"><Skeleton className="h-4 w-20" /></TableHead>
                                <TableHead className="text-right"><Skeleton className="h-4 w-20" /></TableHead>
                                <TableHead className="text-right"><Skeleton className="h-4 w-24" /></TableHead>
                                <TableHead className="text-right"><Skeleton className="h-4 w-16" /></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {[1, 2, 3, 4, 5].map((i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            <Skeleton className="h-4 w-24" />
                                            <Skeleton className="h-3 w-16" />
                                        </div>
                                    </TableCell>
                                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-8 w-24 rounded-md" /></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">الطلبات</h1>
                    <span className="text-sm text-gray-500">{filteredOrders.length} طلب</span>
                </div>

                <div className="relative w-full md:w-72">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="بحث برقم الطلب، اسم العميل..."
                        className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 pr-10 text-sm ring-offset-background file:border-0 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Mobile View */}
            <div className="md:hidden space-y-4">
                {filteredOrders.length === 0 ? (
                    <div className="text-center py-10 bg-white rounded-xl border">
                        <p className="text-gray-500">لا توجد طلبات مطابقة للبحث</p>
                    </div>
                ) : (
                    filteredOrders.map((order) => (
                        <div key={order.id} className="bg-white p-4 rounded-xl border shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className="text-xs font-mono text-gray-500">#{order.id.slice(0, 8)}</span>
                                    <h3 className="font-bold text-gray-900">{order.full_name || 'غير معروف'}</h3>
                                </div>
                                <div className={`${getStatusColor(order.status || 'pending')} px-2 py-1 rounded-md text-xs font-bold`}>
                                    {getStatusLabel(order.status || 'pending')}
                                </div>
                            </div>

                            <div className="space-y-2 text-sm bg-secondary/20 p-3 rounded-lg mb-4">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">الهاتف:</span>
                                    <span dir="ltr">{order.phone}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-muted-foreground">العنوان:</span>
                                    <span className="leading-relaxed font-medium">{order.address}</span>
                                </div>
                            </div>

                            <div className="mb-4">
                                <h4 className="text-xs font-bold text-muted-foreground mb-2">المنتجات:</h4>
                                {Array.isArray(order.items) && (
                                    <div className="space-y-3">
                                        {order.items.map((item: any, idx: number) => (
                                            <div key={idx} className="flex items-center gap-3 py-2 border-b border-dashed last:border-0 border-border/50">
                                                <div className="w-12 h-12 rounded-lg bg-gray-50 border overflow-hidden flex-shrink-0">
                                                    {item.image ? (
                                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                            <ImageIcon className="w-5 h-5" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start">
                                                        <span className="text-sm font-medium line-clamp-2">{item.name}</span>
                                                        <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded mr-2 shrink-0">x{item.quantity}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t">
                                <div className="flex flex-col">
                                    <span className="text-xs text-muted-foreground">الإجمالي</span>
                                    <span className="font-bold text-primary text-lg">{order.total_amount.toLocaleString()} دج</span>
                                </div>
                                <Select
                                    defaultValue={order.status}
                                    onValueChange={(val) => updateStatus(order.id, val)}
                                >
                                    <SelectTrigger className="w-[120px] h-9">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent dir="rtl">
                                        <SelectItem value="pending">قيد الانتظار</SelectItem>
                                        <SelectItem value="shipped">تم الشحن</SelectItem>
                                        <SelectItem value="delivered">تم التوصيل</SelectItem>
                                        <SelectItem value="cancelled">ملغى</SelectItem>
                                    </SelectContent>
                                </Select>
                                <button
                                    onClick={() => deleteOrder(order.id)}
                                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors mr-2"
                                    title="حذف الطلب"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Desktop View */}
            <div className="hidden md:block rounded-xl border bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50/50">
                            <TableHead className="text-right">رقم الطلب</TableHead>
                            <TableHead className="text-right">العميل</TableHead>
                            <TableHead className="text-right">المنتجات</TableHead>
                            <TableHead className="text-right">السعر الإجمالي</TableHead>
                            <TableHead className="text-right">التاريخ</TableHead>
                            <TableHead className="text-right">الحالة</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredOrders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                                    لا توجد طلبات مطابقة للبحث
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredOrders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-mono text-xs">{order.id.slice(0, 8)}</TableCell>
                                    <TableCell>
                                        <div className="font-medium">{order.full_name || 'غير معروف'}</div>
                                        <div className="text-xs text-gray-500">{order.phone}</div>
                                        <div className="text-xs text-gray-500 truncate max-w-[150px]" title={order.address || ''}>
                                            {order.address}
                                        </div>
                                    </TableCell>
                                    <TableCell style={{ minWidth: '200px' }}>
                                        <div className="text-sm text-gray-600">
                                            {Array.isArray(order.items) ? (
                                                <div className="space-y-2">
                                                    {order.items.slice(0, 3).map((item: any, idx: number) => (
                                                        <div key={idx} className="flex items-center gap-2">
                                                            <div className="w-8 h-8 rounded border bg-gray-50 flex-shrink-0 overflow-hidden">
                                                                {item.image ? (
                                                                    <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center">
                                                                        <ImageIcon className="w-3 h-3 text-gray-300" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col min-w-0">
                                                                <span className="truncate max-w-[140px] text-xs font-medium" title={item.name}>{item.name}</span>
                                                                <span className="text-[10px] text-gray-500">الكمية: {item.quantity}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {order.items.length > 3 && (
                                                        <div className="text-xs text-gray-400 text-center pr-8">+{order.items.length - 3} المزيد</div>
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
                                    <TableCell>
                                        <button
                                            onClick={() => deleteOrder(order.id)}
                                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                                            title="حذف الطلب"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
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
