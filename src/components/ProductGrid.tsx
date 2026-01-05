import { useState } from 'react';
import { motion } from 'framer-motion';
import CategoryPills from './CategoryPills';
import ProductCard from './ProductCard';
import { products } from '@/data/products';

const ProductGrid = () => {
  const [activeCategory, setActiveCategory] = useState('men');

  const filteredProducts = activeCategory === 'sale'
    ? products.filter(p => p.discount)
    : products.filter(p => p.category === activeCategory || activeCategory === 'all');

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

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
      </motion.div>
    </section>
  );
};

export default ProductGrid;