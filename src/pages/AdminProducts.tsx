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
        console.log('AdminProducts: checking user state', { user, loading });
        if (!user) {
            console.log('AdminProducts: no user, redirecting');
            navigate('/auth');
            return;
        }
        console.log('AdminProducts: user found, fetching products');
        fetchProducts();
    }, [user]);

    const fetchProducts = async () => {
        try {
            console.log('AdminProducts: starting fetch');

            // Create a timeout promise to prevent hanging
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Connection timed out')), 5000)
            );

            // Fetch products
            const fetchPromise = supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });

            const result = await Promise.race([fetchPromise, timeoutPromise]) as any;

            if (result.error) throw result.error;

            console.log('AdminProducts: fetch success', result.data?.length);
            setProducts(result.data || []);
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('فشل في تحميل المنتجات (تأكد من إنشاء الجدول)');
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
                                <Label className="text-right">صورة المنتج</Label>
                                <div className="flex flex-col gap-4">
                                    {newProduct.image && (
                                        <div className="relative w-full h-48 rounded-xl overflow-hidden border border-gray-200">
                                            <img src={newProduct.image} alt="Preview" className="w-full h-full object-cover" />
                                            <button
                                                onClick={() => setNewProduct({ ...newProduct, image: '' })}
                                                className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                    <div className="relative">
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;

                                                const toastId = toast.loading('جاري رفع الصورة...');
                                                try {
                                                    const fileExt = file.name.split('.').pop();
                                                    const fileName = `${Math.random()}.${fileExt}`;
                                                    const filePath = `${fileName}`;

                                                    const { error: uploadError } = await supabase.storage
                                                        .from('product-images')
                                                        .upload(filePath, file);

                                                    if (uploadError) throw uploadError;

                                                    const { data } = supabase.storage
                                                        .from('product-images')
                                                        .getPublicUrl(filePath);

                                                    setNewProduct({ ...newProduct, image: data.publicUrl });
                                                    toast.success('تم رفع الصورة بنجاح', { id: toastId });
                                                } catch (error) {
                                                    console.error('Error uploading image:', error);
                                                    toast.error('فشل رفع الصورة', { id: toastId });
                                                }
                                            }}
                                            className="text-right pr-10 pt-2 h-14 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <ImageIcon className="h-5 w-5 text-gray-400" />
                                        </div>
                                    </div>
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
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-4">
                        <div className="animate-spin text-4xl">⏳</div>
                        <p>جاري تحميل البيانات...</p>
                        <div className="text-xs text-left p-4 bg-gray-100 rounded-lg font-mono text-gray-600 max-w-md overflow-auto" dir="ltr">
                            <p><strong>Debug Info:</strong></p>
                            <p>User Email: {user?.email || 'None'}</p>
                            <p>User ID: {user?.id || 'None'}</p>
                            <p>Loading State: true</p>
                            <p>Supabase Status: Connecting...</p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setLoading(false);
                                toast.error('تم إلغاء التحميل يدوياً');
                            }}
                        >
                            فرض إيقاف التحميل
                        </Button>
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                            <span className="text-4xl">📦</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">لا توجد منتجات حالياً</h3>
                        <p className="text-gray-500 max-w-sm mx-auto">
                            لم تقم بإضافة أي منتجات بعد. ابدأ بإضافة منتجك الأول الآن!
                        </p>
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
