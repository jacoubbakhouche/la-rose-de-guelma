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
import { motion } from 'framer-motion';

const EmptyBox3D = () => {
    return (
        <div className="perspective-[800px] w-32 h-32 mx-auto my-8">
            <motion.div
                className="w-full h-full relative"
                style={{ transformStyle: "preserve-3d" }}
                animate={{ rotateY: 360, rotateX: -10 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            >
                {/* Front */}
                <div className="absolute inset-0 bg-[#E8A67F] border-4 border-[#DFA17A] flex flex-col items-center justify-center backface-hidden shadow-inset"
                    style={{ transform: "translateZ(64px)" }}>
                    <div className="absolute top-0 w-8 h-full bg-[#4A6CF7]/20 border-x border-[#4A6CF7]/30" />
                    <span className="font-black text-white text-xl tracking-wider select-none relative z-10 drop-shadow-md">LAROSE</span>
                    <div className="absolute bottom-4 w-12 h-1 bg-white/40 rounded-full" />
                </div>
                {/* Back */}
                <div className="absolute inset-0 bg-[#E8A67F] border-4 border-[#DFA17A] backface-hidden"
                    style={{ transform: "rotateY(180deg) translateZ(64px)" }}>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-full bg-[#4A6CF7]/20 border-x border-[#4A6CF7]/30" />
                </div>
                {/* Right */}
                <div className="absolute inset-0 bg-[#E09F7D] border-4 border-[#D6966F] backface-hidden"
                    style={{ transform: "rotateY(90deg) translateZ(64px)" }}>
                    <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-8 bg-[#4A6CF7]/20 border-y border-[#4A6CF7]/30" />
                </div>
                {/* Left */}
                <div className="absolute inset-0 bg-[#E09F7D] border-4 border-[#D6966F] backface-hidden"
                    style={{ transform: "rotateY(-90deg) translateZ(64px)" }}>
                    <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-8 bg-[#4A6CF7]/20 border-y border-[#4A6CF7]/30" />
                </div>
                {/* Top */}
                <div className="absolute inset-0 bg-[#F0AF8F] border-4 border-[#E5A585] flex items-center justify-center backface-hidden"
                    style={{ transform: "rotateX(90deg) translateZ(64px)" }}>
                    {/* Flaps */}
                    <div className="absolute inset-0 border-t-2 border-b-2 border-dashed border-[#D6966F]/50" />
                    <div className="w-8 h-full bg-[#4A6CF7] opacity-90 shadow-sm" />
                </div>
                {/* Bottom */}
                <div className="absolute inset-0 bg-[#C88A68] border-4 border-[#B87A58] backface-hidden"
                    style={{ transform: "rotateX(-90deg) translateZ(64px)" }} />
            </motion.div>

            {/* Shadow */}
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-24 h-6 bg-black/10 blur-xl rounded-[100%] animate-pulse" />
        </div>
    );
};

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
                    <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
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
                            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-6 min-h-[50vh]">
                                <EmptyBox3D />
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-center space-y-2"
                                >
                                    <h3 className="text-xl font-bold text-foreground">لا توجد منتجات هنا!</h3>
                                    <p className="text-sm">لم نتمكن من العثور على أي منتجات في هذه الفئة.</p>
                                </motion.div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Search;
