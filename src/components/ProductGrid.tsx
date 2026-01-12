import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CategoryPills from './CategoryPills';
import ProductCard from './ProductCard';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/context/CartContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

interface ProductGridProps {
  searchTerm?: string;
}

const ProductGrid = ({ searchTerm = '' }: ProductGridProps) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  const ITEMS_PER_ROW = 6;
  const ROWS_TO_SHOW = 3;
  const ITEMS_PER_PAGE = ITEMS_PER_ROW * ROWS_TO_SHOW; // 18 items

  useEffect(() => {
    fetchProducts();
  }, []);

  // Reset page when category changes
  useEffect(() => {
    setPage(0);
  }, [activeCategory]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false }); // Latest first

      if (!error && data) {
        setProducts(data as any);
      }
    } catch (error) {
      console.error('Error loading products', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p => {
    // Search Filter
    if (searchTerm && !p.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    if (activeCategory === 'all') return true;
    if (activeCategory === 'new') {
      const isRecent = p.created_at
        ? (new Date().getTime() - new Date(p.created_at).getTime()) < (48 * 60 * 60 * 1000)
        : false;
      return p.is_new === true || isRecent;
    }
    const productCategory = (p.category || '').toLowerCase().trim();
    const targetCategory = activeCategory.toLowerCase().trim();
    return productCategory === targetCategory;
  });

  // Pagination Logic
  const visibleProducts = filteredProducts.slice(0, (page + 1) * ITEMS_PER_PAGE);
  const totalAvailable = filteredProducts.length;
  const hasMore = visibleProducts.length < totalAvailable;

  // Chunking for rows
  const chunkedProducts = [];
  for (let i = 0; i < visibleProducts.length; i += ITEMS_PER_ROW) {
    chunkedProducts.push(visibleProducts.slice(i, i + ITEMS_PER_ROW));
  }

  return (
    <section className="container px-4 pb-8 pt-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <CategoryPills
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />

        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((row) => (
              <div key={row} className="flex gap-4 overflow-hidden">
                {[1, 2, 3, 4].map(i => (
                  <Skeleton key={i} className="min-w-[160px] h-[250px] rounded-2xl" />
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {chunkedProducts.length > 0 ? (
              <div className="space-y-8">
                {chunkedProducts.map((rowProducts, rowIndex) => (
                  <div key={rowIndex} className="space-y-2">
                    {/* Optional: Add Row Title if grouped by something, but here generic rows */}
                    <div
                      className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
                      style={{
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none'
                      }}
                    >
                      <AnimatePresence mode="popLayout">
                        {rowProducts.map((product, index) => (
                          <motion.div
                            key={product.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="min-w-[160px] w-[160px] sm:min-w-[200px] sm:w-[200px] snap-start"
                          >
                            <ProductCard product={product} index={index} />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No products in this category
              </div>
            )}

            {hasMore && (
              <div className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setPage(prev => prev + 1)}
                  className="gap-2 rounded-full px-8"
                >
                  Show More <ChevronDown className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </section>
  );
};

export default ProductGrid;