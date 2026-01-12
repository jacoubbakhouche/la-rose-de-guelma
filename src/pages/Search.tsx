import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/context/CartContext';
import ProductCard from '@/components/ProductCard';
import { categories } from '@/data/products';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Search as SearchIcon, X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const Search = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });
            if (!error && data) {
                setProducts(data as any);
            }
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = searchTerm === '' || p.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !activeCategory || activeCategory === 'all' || p.category === activeCategory || (activeCategory === 'new' && p.is_new);

        return matchesSearch && matchesCategory;
    });

    const showResults = searchTerm.length > 0 || activeCategory !== null;

    return (
        <div className="min-h-screen bg-background flex flex-col" dir="rtl">
            {/* Search Header */}
            <div className="sticky top-0 z-50 bg-background border-b p-4 flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="shrink-0">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="relative flex-1">
                    <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        ref={inputRef}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="ابحث عن منتج..."
                        className="pr-9 pl-9 bg-secondary border-none h-11 rounded-xl focus-visible:ring-1 focus-visible:ring-primary"
                    />
                    {searchTerm && (
                        <button onClick={() => setSearchTerm('')} className="absolute left-3 top-1/2 -translate-y-1/2 p-1">
                            <X className="w-4 h-4 text-muted-foreground" />
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-4 overflow-y-auto">
                {!showResults ? (
                    /* Categories Grid */
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <div>
                            <h2 className="text-lg font-bold mb-4">تصفح الفئات</h2>
                            <div className="grid grid-cols-2 gap-3">
                                {categories.filter(c => c.id !== 'all').map(category => (
                                    <button
                                        key={category.id}
                                        onClick={() => setActiveCategory(category.id)}
                                        className="aspect-[2/1] rounded-2xl flex items-center justify-center text-lg font-bold transition-all hover:scale-[1.02] active:scale-95 bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground shadow-sm"
                                    >
                                        {category.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Results */
                    <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold">
                                {activeCategory ? categories.find(c => c.id === activeCategory)?.label : 'نتائج البحث'}
                                <span className="text-sm font-normal text-muted-foreground mr-2">({filteredProducts.length})</span>
                            </h2>
                            <Button variant="ghost" size="sm" onClick={() => { setActiveCategory(null); setSearchTerm(''); }} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                مسح الكل
                            </Button>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-2 gap-4">
                                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-60 rounded-2xl" />)}
                            </div>
                        ) : filteredProducts.length > 0 ? (
                            <div className="grid grid-cols-2 gap-3 pb-8">
                                {filteredProducts.map((product, index) => (
                                    <ProductCard key={product.id} product={product} index={index} />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-4">
                                <SearchIcon className="w-12 h-12 opacity-20" />
                                <p>لا توجد نتائج مطابقة</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Search;
