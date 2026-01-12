import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useFavorites } from '@/context/FavoritesContext';
import ProductCard from '@/components/ProductCard';
import Header from '@/components/Header';

const Favorites = () => {
    const { favorites } = useFavorites();

    return (
        <div className="min-h-screen bg-background pb-20 md:pb-8">
            <Header />

            <main className="container px-4 py-8">
                <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Heart className="w-6 h-6 text-primary fill-primary" />
                    المفضلة ({favorites.length})
                </h1>

                {favorites.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mb-4">
                            <Heart className="w-10 h-10 text-muted-foreground" />
                        </div>
                        <h2 className="text-xl font-semibold mb-2">قائمة المفضلة فارغة</h2>
                        <p className="text-muted-foreground mb-6">أضف بعض المنتجات التي تعجبك هنا</p>
                        <Link to="/">
                            <button className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors">
                                تصفح المنتجات
                            </button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {favorites.map((product, index) => (
                            <ProductCard key={product.id} product={product} index={index} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Favorites;
