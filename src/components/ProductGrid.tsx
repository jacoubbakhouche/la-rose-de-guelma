import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CategoryPills from './CategoryPills';
import ProductCard from './ProductCard';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/context/CartContext';

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
    if (activeCategory === 'sale') return (p.discount || 0) > 0;
    if (activeCategory === 'new') return p.is_new === true;

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
              <div key={i} className="bg-gray-100 rounded-2xl h-[300px] animate-pulse" />
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