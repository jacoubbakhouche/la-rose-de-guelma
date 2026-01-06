import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Product } from '@/context/CartContext';

interface ProductCardProps {
  product: Product;
  index: number;
}

const ProductCard = ({ product, index }: ProductCardProps) => {
  const discountedPrice = product.discount
    ? product.price * (1 - product.discount / 100)
    : product.price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Link to={`/product/${product.id}`}>
        <motion.div
          whileHover={{ y: -5 }}
          className="group relative bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-elevated transition-all duration-300"
        >
          {/* Discount Badge */}
          {product.discount && (
            <div className="absolute top-3 right-3 z-10 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full">
              {product.discount}%
            </div>
          )}

          <div className="relative aspect-[3/4] bg-gray-50">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>

          {/* Content */}
          <div className="p-4 space-y-2">
            <h3 className="font-medium text-foreground truncate">{product.name}</h3>
            <div className="flex items-center gap-2">
              <span className="font-bold text-foreground">
                {Math.round(discountedPrice).toLocaleString()} دج
              </span>
              {product.discount && (
                <span className="text-sm text-muted-foreground line-through">
                  {product.price.toLocaleString()} دج
                </span>
              )}
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;