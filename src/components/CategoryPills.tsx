import { motion } from 'framer-motion';
import { categories } from '@/data/products';

interface CategoryPillsProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryPills = ({ activeCategory, onCategoryChange }: CategoryPillsProps) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((category, index) => (
        <motion.button
          key={category.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          onClick={() => onCategoryChange(category.id)}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
            activeCategory === category.id
              ? 'bg-primary text-primary-foreground shadow-soft'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          {category.labelEn}
        </motion.button>
      ))}
    </div>
  );
};

export default CategoryPills;