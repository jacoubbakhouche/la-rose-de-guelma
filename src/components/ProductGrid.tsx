import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CategoryPills from './CategoryPills';
import ProductCard from './ProductCard';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/context/CartContext';
import { Skeleton } from '@/components/ui/skeleton';

const ProductGrid = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*');

      if (!error && data) {
        // Transform if necessary to match Product interface
        // Assuming DB columns match interface mostly
        setProducts(data as any);
      }
    } catch (error) {
      console.error('Error loading products', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'new') {
      const isRecent = p.created_at
        ? (new Date().getTime() - new Date(p.created_at).getTime()) < (48 * 60 * 60 * 1000)
        : false;
      return p.is_new === true || isRecent;
    }

    // Case-insensitive comparison and handle nulls
    const productCategory = (p.category || '').toLowerCase().trim();
    const targetCategory = activeCategory.toLowerCase().trim();

    return productCategory === targetCategory;
  });

  return (
    <section className="container px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <CategoryPills
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-[300px] rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                لا توجد منتجات في هذه الفئة
              </div>
            )}
          </div>
        )}
      </motion.div>
    </section>
  );
};

export default ProductGrid;