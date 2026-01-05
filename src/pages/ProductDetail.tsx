import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Star, ShoppingBag } from 'lucide-react';
import { products } from '@/data/products';
import { useCart } from '@/context/CartContext';
import { toast } from '@/hooks/use-toast';

const ProductDetail = () => {
  const { id } = useParams();
  const product = products.find((p) => p.id === id);
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState<string | undefined>();
  const [selectedColor, setSelectedColor] = useState<string | undefined>();
  const [liked, setLiked] = useState(false);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">المنتج غير موجود</p>
      </div>
    );
  }

  const discountedPrice = product.discount
    ? product.price * (1 - product.discount / 100)
    : product.price;

  const handleAddToCart = () => {
    if (product.sizes && !selectedSize) {
      toast({
        title: 'اختر المقاس',
        description: 'الرجاء اختيار المقاس قبل الإضافة للسلة',
        variant: 'destructive',
      });
      return;
    }
    addToCart(product, selectedSize, selectedColor);
    toast({
      title: 'تمت الإضافة',
      description: `${product.name} أضيف إلى السلة`,
    });
  };

  const colorMap: Record<string, string> = {
    purple: 'bg-violet-500',
    white: 'bg-slate-100 border border-border',
    black: 'bg-slate-900',
    beige: 'bg-amber-100',
    gray: 'bg-slate-400',
    khaki: 'bg-amber-600',
    olive: 'bg-lime-700',
    red: 'bg-red-500',
    navy: 'bg-blue-900',
    gold: 'bg-yellow-500',
    silver: 'bg-slate-300',
    cream: 'bg-amber-50 border border-border',
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="container flex items-center justify-between h-16 px-4">
          <Link to="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-full hover:bg-secondary transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </motion.button>
          </Link>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setLiked(!liked)}
            className="p-2 rounded-full hover:bg-secondary transition-colors"
          >
            <Heart
              className={`w-5 h-5 transition-colors ${
                liked ? 'fill-destructive text-destructive' : 'text-foreground'
              }`}
            />
          </motion.button>
        </div>
      </header>

      {/* Product Image */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative bg-gradient-to-br from-secondary to-muted aspect-square"
      >
        <motion.img
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain p-8"
        />
      </motion.div>

      {/* Product Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="container px-4 py-6 space-y-6"
      >
        {/* Title & Price */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">{product.name}</h1>
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-foreground">
              {Math.round(discountedPrice).toLocaleString()} دج
            </span>
            {product.discount && (
              <span className="text-muted-foreground line-through">
                {product.price.toLocaleString()} دج
              </span>
            )}
          </div>
        </div>

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(product.rating!)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-muted'
                  }`}
                />
              ))}
            </div>
            <span className="font-medium text-foreground">{product.rating}</span>
            <span className="text-muted-foreground text-sm">
              ({product.reviews} تقييم)
            </span>
          </div>
        )}

        {/* Colors */}
        {product.colors && (
          <div className="space-y-3">
            <span className="text-sm font-medium text-foreground">اللون</span>
            <div className="flex gap-3">
              {product.colors.map((color) => (
                <motion.button
                  key={color}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full ${colorMap[color]} ${
                    selectedColor === color
                      ? 'ring-2 ring-primary ring-offset-2'
                      : ''
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Sizes */}
        {product.sizes && (
          <div className="space-y-3">
            <span className="text-sm font-medium text-foreground">المقاس</span>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <motion.button
                  key={size}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedSize(size)}
                  className={`min-w-[44px] h-11 px-4 rounded-xl font-medium transition-all ${
                    selectedSize === size
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  {size}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Add to Cart Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAddToCart}
          className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-soft"
        >
          <ShoppingBag className="w-5 h-5" />
          <span>أضف إلى السلة</span>
        </motion.button>
      </motion.div>
    </div>
  );
};

export default ProductDetail;