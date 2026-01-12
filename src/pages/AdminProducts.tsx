import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Trash2, Package, Save, Image as ImageIcon, Pencil, Search } from 'lucide-react';
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
import { Skeleton } from '@/components/ui/skeleton';

interface Product {
    id: string;
    name: string;
    price: number;
    category: string;
    image: string;
    images?: string[];
    discount?: number;
    description?: string;
    colors?: string[];
    sizes?: string[];
    is_new?: boolean;
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
    const [editingId, setEditingId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Form State
    const [newProduct, setNewProduct] = useState({
        name: '',
        price: '',
        description: '',
        image: '',
        images: [] as string[],
        category: '',
        discount: '',
        colors: '',
        sizes: ''
    });
    const [customColor, setCustomColor] = useState('#000000');
    const [lastError, setLastError] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            fetchProducts();
        }
    }, [user]);

    const resetForm = () => {
        setNewProduct({
            name: '', price: '', description: '', image: '', images: [], category: '', discount: '', colors: '', sizes: ''
        });
        setEditingId(null);
    };

    const handleEdit = (product: Product) => {
        setEditingId(product.id);
        setNewProduct({
            name: product.name,
            price: product.price.toString(),
            description: product.description || '',
            image: product.image,
            images: product.images || [],
            category: product.category,
            discount: product.discount?.toString() || '',
            colors: Array.isArray(product.colors) ? product.colors.join(',') : '',
            sizes: Array.isArray(product.sizes) ? product.sizes.join(',') : ''
        });
        setIsOpen(true);
    };

    const handleSaveProduct = async () => {
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
                image: newProduct.image || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
                images: newProduct.images.length > 0 ? newProduct.images : [newProduct.image],
                category: newProduct.category,
                discount: newProduct.discount ? parseInt(newProduct.discount) : 0,
                colors: newProduct.colors ? newProduct.colors.split(',').map(s => s.trim()) : [],
                sizes: newProduct.sizes ? newProduct.sizes.split(',').map(s => s.trim()) : [],
                is_new: newProduct.category === 'new'
            };

            let error;
            if (editingId) {
                // Update
                const res = await supabase.from('products').update(payload).eq('id', editingId);
                error = res.error;
            } else {
                // Insert
                const res = await supabase.from('products').insert(payload);
                error = res.error;
            }

            if (error) throw error;

            toast.success(editingId ? 'تم تحديث المنتج' : 'تمت إضافة المنتج');
            setIsOpen(false);
            resetForm();
            fetchProducts();
        } catch (error) {
            console.error('Error saving product:', error);
            toast.error('حدث خطأ أثناء الحفظ');
        } finally {
            setSubmitting(false);
        }
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            setLastError(null);

            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            setProducts(data || []);
        } catch (error: any) {
            console.error('Error fetching products:', error);
            setLastError(error.message);
            toast.error('فشل في تحميل المنتجات');
        } finally {
            setLoading(false);
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

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

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

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                        placeholder="بحث عن منتج..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pr-10 h-12 rounded-xl bg-white border-gray-100 shadow-sm text-right focus-visible:ring-purple-500"
                    />
                </div>

                {/* Add New Button */}
                <Dialog open={isOpen} onOpenChange={(open) => {
                    setIsOpen(open);
                    if (!open) resetForm();
                }}>
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
                            <DialogTitle className="text-right">
                                {editingId ? 'تعديل المنتج' : 'بيانات المنتج الجديد'}
                            </DialogTitle>
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
                                <Label className="text-right">صور المنتج</Label>
                                <div className="flex flex-col gap-4">
                                    {/* Image Preview Grid */}
                                    {newProduct.images && newProduct.images.length > 0 && (
                                        <div className="grid grid-cols-4 gap-2">
                                            {newProduct.images.map((imgUrl, idx) => (
                                                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                                                    <img src={imgUrl} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                                                    <button
                                                        onClick={() => {
                                                            const newImages = newProduct.images.filter((_, i) => i !== idx);
                                                            setNewProduct({
                                                                ...newProduct,
                                                                images: newImages,
                                                                image: newImages[0] || ''
                                                            });
                                                        }}
                                                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                    {idx === 0 && (
                                                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] text-center py-1">
                                                            الرئيسية
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Upload Button */}
                                    <div className="relative">
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={async (e) => {
                                                const files = e.target.files;
                                                if (!files || files.length === 0) return;

                                                const toastId = toast.loading(`جاري رفع ${files.length} صورة...`);
                                                const uploadedUrls: string[] = [];

                                                try {
                                                    for (let i = 0; i < files.length; i++) {
                                                        const file = files[i];
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

                                                        uploadedUrls.push(data.publicUrl);
                                                    }

                                                    setNewProduct(prev => ({
                                                        ...prev,
                                                        images: [...(prev.images || []), ...uploadedUrls],
                                                        image: prev.image || uploadedUrls[0]
                                                    }));

                                                    toast.success('تم رفع الصور بنجاح', { id: toastId });
                                                } catch (error) {
                                                    console.error('Error uploading images:', error);
                                                    toast.error('فشل رفع بعض الصور', { id: toastId });
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
                                <Label className="text-right">الألوان المتاحة</Label>
                                <div className="p-4 border rounded-xl bg-gray-50/50 space-y-3">
                                    <div className="flex flex-wrap gap-2">
                                        {[
                                            { id: 'purple', val: '#8b5cf6', label: 'بـنفسجي' },
                                            { id: 'black', val: '#0f172a', label: 'أسود' },
                                            { id: 'white', val: '#ffffff', label: 'أبيض' },
                                            { id: 'red', val: '#ef4444', label: 'أحمر' },
                                            { id: 'blue', val: '#2563eb', label: 'أزرق' },
                                            { id: 'green', val: '#16a34a', label: 'أخضر' },
                                            { id: 'yellow', val: '#facc15', label: 'أصفر' },
                                            { id: 'pink', val: '#f472b6', label: 'وردي' },
                                        ].map((color) => {
                                            const currentColors = newProduct.colors ? newProduct.colors.split(',').filter(Boolean) : [];
                                            const isSelected = currentColors.includes(color.id);

                                            return (
                                                <button
                                                    key={color.id}
                                                    onClick={() => {
                                                        let newColors;
                                                        if (isSelected) {
                                                            newColors = currentColors.filter(c => c !== color.id);
                                                        } else {
                                                            newColors = [...currentColors, color.id];
                                                        }
                                                        setNewProduct({ ...newProduct, colors: newColors.join(',') });
                                                    }}
                                                    className={`w-8 h-8 rounded-full border shadow-sm transition-all ${isSelected ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'hover:scale-105 opacity-80 hover:opacity-100'}`}
                                                    style={{ backgroundColor: color.val }}
                                                    title={color.label}
                                                />
                                            );
                                        })}

                                        <div className="flex items-center gap-2">
                                            <div className="relative group">
                                                <input
                                                    type="color"
                                                    id="customColorInput"
                                                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                                                    value={customColor}
                                                    onChange={(e) => setCustomColor(e.target.value)}
                                                />
                                                <div
                                                    className="w-10 h-10 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-primary hover:text-primary transition-colors overflow-hidden"
                                                    style={{ backgroundColor: customColor }}
                                                >
                                                    {customColor === '#000000' && <Plus className="w-5 h-5 text-gray-400" />}
                                                </div>
                                            </div>

                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                onClick={() => {
                                                    const currentColors = newProduct.colors ? newProduct.colors.split(',').filter(Boolean) : [];
                                                    if (!currentColors.includes(customColor)) {
                                                        const newColors = [...currentColors, customColor];
                                                        setNewProduct({ ...newProduct, colors: newColors.join(',') });
                                                        toast.success('تمت إضافة اللون');
                                                    }
                                                }}
                                                className="w-10 h-10 rounded-full bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
                                            >
                                                <Plus className="w-5 h-5" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {newProduct.colors.split(',').filter(Boolean).map((color, idx) => (
                                            <div key={idx} className="flex items-center gap-1 bg-white px-2 py-1 rounded-full border text-xs">
                                                <div
                                                    className="w-3 h-3 rounded-full border"
                                                    style={{ backgroundColor: color.startsWith('#') ? color : (color === 'purple' ? '#8b5cf6' : color) }}
                                                />
                                                <span>{color}</span>
                                                <button
                                                    onClick={() => {
                                                        const newColors = newProduct.colors.split(',').filter(c => c !== color);
                                                        setNewProduct({ ...newProduct, colors: newColors.join(',') });
                                                    }}
                                                    className="text-gray-400 hover:text-red-500"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
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

                            <Button onClick={handleSaveProduct} disabled={submitting} className="mt-4 w-full">
                                {submitting ? 'جاري الحفظ...' : (editingId ? 'تحديث المنتج' : 'حفظ المنتج')}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((n) => (
                            <Skeleton key={n} className="h-24 w-full rounded-2xl" />
                        ))}
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-20">
                        {searchTerm ? (
                            <>
                                <div className="text-4xl mb-4">🔍</div>
                                <h3 className="text-xl font-bold text-gray-900 mb-1">لا توجد نتائج</h3>
                                <p className="text-gray-500">جرب البحث بكلمات أخرى</p>
                            </>
                        ) : (
                            <>
                                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                                    <span className="text-4xl">📦</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-1">لا توجد منتجات حالياً</h3>
                                <p className="text-gray-500 max-w-sm mx-auto">
                                    لم تقم بإضافة أي منتجات بعد.
                                </p>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <AnimatePresence>
                            {filteredProducts.map((product) => (
                                <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className="w-16 h-16 rounded-xl bg-gray-50 overflow-hidden flex-shrink-0">
                                                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-gray-900 truncate">{product.name}</h3>
                                                <p className="text-sm text-gray-500">{product.category}</p>
                                                <p className="text-sm font-bold text-primary mt-1">{product.price.toLocaleString()} دج</p>
                                            </div>
                                        </div>

                                        {/* Desktop Actions */}
                                        <div className="hidden sm:flex items-center gap-2 self-center">
                                            <button
                                                onClick={() => handleEdit(product)}
                                                className="w-9 h-9 flex items-center justify-center rounded-xl bg-blue-50 text-blue-500 hover:bg-blue-100 transition-colors"
                                                title="تعديل"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                                                title="حذف"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Mobile Actions - Full Width Buttons below */}
                                    <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t sm:hidden">
                                        <button
                                            onClick={() => handleEdit(product)}
                                            className="flex items-center justify-center gap-2 h-10 rounded-xl bg-blue-50 text-blue-600 font-medium hover:bg-blue-100 transition-colors active:scale-95"
                                        >
                                            <Pencil className="w-4 h-4" />
                                            <span>تعديل</span>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product.id)}
                                            className="flex items-center justify-center gap-2 h-10 rounded-xl bg-red-50 text-red-600 font-medium hover:bg-red-100 transition-colors active:scale-95"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            <span>حذف</span>
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
