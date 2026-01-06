import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Trash2, Package, Save, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';

interface Product {
    id: string;
    name: string;
    price: number;
    category: string;
    image: string;
    discount?: number;
}

const CATEGORIES = [
    { id: 'men', label: 'رجال' },
    { id: 'women', label: 'نساء' },
    { id: 'kids', label: 'أطفال' },
    { id: 'new', label: 'جديد' },
    { id: 'sale', label: 'تخفيضات' },
];

const AdminProducts = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [newProduct, setNewProduct] = useState({
        name: '',
        price: '',
        description: '',
        image: '',
        category: '',
        discount: '',
        colors: '', // Comma separated
        sizes: ''   // Comma separated
    });

    useEffect(() => {
        if (!user) {
            navigate('/auth');
            return;
        }
        fetchProducts();
    }, [user]);

    const fetchProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProducts(data || []);
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('فشل في تحميل المنتجات');
        } finally {
            setLoading(false);
        }
    };

    const handleAddProduct = async () => {
        if (!newProduct.name || !newProduct.price || !newProduct.category) {
            toast.error('يرجى ملء الحقول الأساسية');
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                name: newProduct.name,
                description: newProduct.description,
                price: parseFloat(newProduct.price),
                image: newProduct.image || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80', // Default placeholder
                category: newProduct.category,
                discount: newProduct.discount ? parseInt(newProduct.discount) : 0,
                colors: newProduct.colors ? newProduct.colors.split(',').map(s => s.trim()) : [],
                sizes: newProduct.sizes ? newProduct.sizes.split(',').map(s => s.trim()) : [],
                is_new: newProduct.category === 'new'
            };

            const { error } = await supabase.from('products').insert(payload);
            if (error) throw error;

            toast.success('تمت إضافة المنتج بنجاح');
            setIsOpen(false);
            setNewProduct({
                name: '', price: '', description: '', image: '', category: '', discount: '', colors: '', sizes: ''
            });
            fetchProducts();
        } catch (error) {
            console.error('Error adding product:', error);
            toast.error('حدث خطأ أثناء الإضافة');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;

        try {
            const { error } = await supabase.from('products').delete().eq('id', id);
            if (error) throw error;
            toast.success('تم حذف المنتج');
            setProducts(products.filter(p => p.id !== id));
        } catch (error) {
            toast.error('فشل الحذف');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="container flex items-center justify-between h-16 px-4">
                    <Link to="/profile">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-gray-100"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-700" />
                        </motion.button>
                    </Link>
                    <h1 className="text-lg font-bold text-gray-900">إدارة المنتجات</h1>
                    <div className="w-10" />
                </div>
            </header>

            <main className="container px-4 py-6 space-y-6">

                {/* Add New Button */}
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full h-14 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center gap-2 text-white font-medium shadow-lg shadow-purple-200"
                        >
                            <Plus className="w-5 h-5" />
                            <span>إضافة منتج جديد</span>
                        </motion.button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-right">بيانات المنتج</DialogTitle>
                        </DialogHeader>
                        <div className="flex flex-col gap-4 py-4">

                            <div className="grid gap-2">
                                <Label className="text-right">اسم المنتج *</Label>
                                <Input
                                    value={newProduct.name}
                                    onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                                    placeholder="مثال: حذاء نايك"
                                    className="text-right"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label className="text-right">السعر (دج) *</Label>
                                    <Input
                                        type="number"
                                        value={newProduct.price}
                                        onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                                        className="text-right"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label className="text-right">الخصم (%)</Label>
                                    <Input
                                        type="number"
                                        value={newProduct.discount}
                                        onChange={e => setNewProduct({ ...newProduct, discount: e.target.value })}
                                        className="text-right"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label className="text-right">التصنيف *</Label>
                                <Select
                                    onValueChange={val => setNewProduct({ ...newProduct, category: val })}
                                    value={newProduct.category}
                                >
                                    <SelectTrigger className="w-full text-right" dir="rtl">
                                        <SelectValue placeholder="اختر التصنيف" />
                                    </SelectTrigger>
                                    <SelectContent dir="rtl">
                                        {CATEGORIES.map(c => (
                                            <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label className="text-right">رابط الصورة (URL)</Label>
                                <div className="relative">
                                    <ImageIcon className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
                                    <Input
                                        value={newProduct.image}
                                        onChange={e => setNewProduct({ ...newProduct, image: e.target.value })}
                                        placeholder="https://..."
                                        className="text-right pr-10"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label className="text-right">الوصف</Label>
                                <Textarea
                                    value={newProduct.description}
                                    onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                                    className="text-right"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label className="text-right">الألوان (مفصول بفاصلة)</Label>
                                <Input
                                    value={newProduct.colors}
                                    onChange={e => setNewProduct({ ...newProduct, colors: e.target.value })}
                                    placeholder="red, black, white"
                                    className="text-right"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label className="text-right">المقاسات (مفصول بفاصلة)</Label>
                                <Input
                                    value={newProduct.sizes}
                                    onChange={e => setNewProduct({ ...newProduct, sizes: e.target.value })}
                                    placeholder="S, M, L, XL"
                                    className="text-right"
                                />
                            </div>

                            <Button onClick={handleAddProduct} disabled={submitting} className="mt-4 w-full">
                                {submitting ? 'جاري الحفظ...' : 'حفظ المنتج'}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {loading ? (
                    <div className="text-center py-10 text-muted-foreground">جاري التحميل...</div>
                ) : products.length === 0 ? (
                    <div className="text-center py-10">
                        <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">لا توجد منتجات حالياً</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <AnimatePresence>
                            {products.map((product) => (
                                <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4"
                                >
                                    <div className="w-16 h-16 rounded-xl bg-gray-50 overflow-hidden flex-shrink-0">
                                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-gray-900 truncate">{product.name}</h3>
                                        <p className="text-sm text-gray-500">{product.category}</p>
                                        <p className="text-sm font-bold text-primary mt-1">{product.price.toLocaleString()} دج</p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleDelete(product.id)}
                                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminProducts;
