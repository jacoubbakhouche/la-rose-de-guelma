import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Product } from '@/context/CartContext';
import { Flame, Heart } from 'lucide-react';
import { useFavorites } from '@/context/FavoritesContext';

interface ProductCardProps {
  product: Product;
  index: number;
}

const ProductCard = ({ product, index }: ProductCardProps) => {
  const { toggleFavorite, isFavorite } = useFavorites();
  const isFav = isFavorite(product.id);

  // Logic to determine if product is "new" (added in last 48 hours)
  const isRecent = product.created_at
    ? (new Date().getTime() - new Date(product.created_at).getTime()) < (48 * 60 * 60 * 1000)
    : false;

  const showNewBadge = product.is_new || isRecent;

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
          {/* Image Container - Full Bleed */}
          <div className="relative aspect-[3/4] w-full overflow-hidden bg-white">
            <img
              alt={product.name}
              src={product.image}
              className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
            />

            {/* Discount Badge - Top Right */}
            {product.discount && product.discount > 0 ? (
              <div className="absolute top-2 right-2 rounded-full bg-primary/90 px-2 py-0.5 text-xs font-bold text-white backdrop-blur-sm z-10">
                {product.discount}%
              </div>
            ) : null}

            {/* New Badge - Top Left (Flame Style) */}
            {showNewBadge && (
              <div className="absolute top-2 left-2 z-10 flex items-center justify-center drop-shadow-md">
                {/* Flame Icon Background */}
                <Flame className="w-12 h-12 text-red-500 fill-red-500 animate-pulse filter drop-shadow-lg" />

                {/* "NOW" Text Inside */}
                <span className="absolute top-[60%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-[9px] font-black text-white tracking-tighter">
                  NOW
                </span>
              </div>
            )}

            {/* Favorite Button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                toggleFavorite(product);
              }}
              className="absolute bottom-2 right-2 z-20 p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:scale-110 transition-transform"
            >
              <Heart className={`w-5 h-5 transition-colors ${isFav ? 'text-red-500 fill-red-500' : 'text-gray-600'}`} />
            </button>
          </div>

          <div className="p-4 text-right">
            <h3 className="mb-1 text-base font-bold text-gray-900 line-clamp-1 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            <div className="flex items-center justify-end gap-2 flex-wrap">
              <span className="text-lg font-bold text-gray-900">
                {Math.round(discountedPrice).toLocaleString()} دج
              </span>
              {product.discount && product.discount > 0 ? (
                <span className="text-sm text-gray-400 line-through">
                  {product.price.toLocaleString()} دج
                </span>
              ) : null}
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;