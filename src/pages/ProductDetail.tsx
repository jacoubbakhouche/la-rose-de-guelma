import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Heart, Star, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  images?: string[]; // Multiple images
  discount?: number;
  rating?: number;
  reviews?: number;
  colors?: string[];
  sizes?: string[];
  description?: string;
}

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [activeImage, setActiveImage] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string | undefined>();
  const [selectedColor, setSelectedColor] = useState<string | undefined>();
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setProduct(data);
        setActiveImage(data.image); // Initialize with main image
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 mt-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="w-full aspect-[3/4] rounded-2xl" />
          <div className="space-y-6">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <div className="flex gap-4 pt-4">
              <Skeleton className="h-12 w-1/3 rounded-xl" />
              <Skeleton className="h-12 w-1/3 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (!product) return <div className="min-h-screen flex text-center justify-center p-10"><p>المنتج غير موجود</p></div>;

  const discountedPrice = product.discount
    ? product.price * (1 - product.discount / 100)
    : product.price;

  // Combine main image with extra images array for gallery
  const allImages = product.images && product.images.length > 0
    ? product.images
    : [product.image];

  // Ensure main image is first if not already
  if (!allImages.includes(product.image)) {
    allImages.unshift(product.image);
  }

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
              className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-gray-100 hover:shadow-[0_4px_15px_rgba(0,0,0,0.12)] transition-shadow"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </motion.button>
          </Link>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setLiked(!liked)}
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-gray-100 hover:shadow-[0_4px_15px_rgba(0,0,0,0.12)] transition-shadow"
          >
            <Heart
              className={`w-5 h-5 transition-colors ${liked ? 'fill-destructive text-destructive' : 'text-foreground'
                }`}
            />
          </motion.button>
        </div>
      </header>

      {/* Product Image & Gallery */}
      <div className="bg-gray-50 pb-6 rounded-b-[2rem] shadow-sm">
        <Dialog>
          <DialogTrigger asChild>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative bg-white aspect-[3/4] md:aspect-square cursor-zoom-in overflow-hidden mx-auto max-w-md md:rounded-2xl md:mt-4 md:shadow-md"
            >
              <motion.img
                key={activeImage} // Re-animate on change
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                src={activeImage}
                alt={product.name}
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-xs backdrop-blur-md">
                اضغط للتكبير 🔍
              </div>
            </motion.div>
          </DialogTrigger>
          <DialogContent className="max-w-4xl w-full h-[90vh] p-0 bg-transparent border-none shadow-none flex items-center justify-center">
            <div className="relative w-full h-full flex items-center justify-center p-4">
              <img
                src={activeImage}
                alt={product.name}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              />
            </div>
          </DialogContent>
        </Dialog>

        {/* Thumbnail Strip */}
        {allImages.length > 1 && (
          <div className="flex gap-3 overflow-x-auto px-4 mt-4 pb-2 snap-x">
            {allImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(img)}
                className={`relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all snap-center ${activeImage === img ? 'border-primary ring-2 ring-primary/20' : 'border-transparent opacity-70'}`}
              >
                <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

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
                  className={`w-4 h-4 ${i < Math.floor(product.rating!)
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
              {product.colors.map((color) => {
                const isHex = color.startsWith('#');
                const bgClass = isHex ? '' : (colorMap[color] || 'bg-gray-200');

                return (
                  <motion.button
                    key={color}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-full ${bgClass} ${selectedColor === color
                      ? 'ring-2 ring-primary ring-offset-2'
                      : ''
                      }`}
                    style={isHex ? { backgroundColor: color } : {}}
                    title={color}
                  />
                );
              })}
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
                  className={`min-w-[44px] h-11 px-4 rounded-xl font-medium transition-all ${selectedSize === size
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