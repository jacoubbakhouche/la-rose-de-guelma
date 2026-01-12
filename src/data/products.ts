import sneakersPurple from '@/assets/sneakers-purple.jpg';
import hoodieBeige from '@/assets/hoodie-beige.jpg';
import cargoPants from '@/assets/cargo-pants.jpg';
import pufferJacket from '@/assets/puffer-jacket.jpg';
import sneakersGold from '@/assets/sneakers-gold.jpg';
import sneakersWhite from '@/assets/sneakers-white.jpg';

import { Product } from '@/context/CartContext';

export const products: Product[] = [
  {
    id: '1',
    name: 'حذاء رياضي بنفسجي',
    price: 15000,
    image: sneakersPurple,
    category: 'men',
    discount: 23,
    rating: 4.7,
    reviews: 147,
    sizes: ['38', '39', '40', '41', '42', '43'],
    colors: ['purple', 'white', 'black'],
  },
  {
    id: '2',
    name: 'هودي كلاسيكي',
    price: 8000,
    image: hoodieBeige,
    category: 'men',
    rating: 4.5,
    reviews: 89,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['beige', 'gray', 'black'],
  },
  {
    id: '3',
    name: 'بنطال كارغو',
    price: 8000,
    image: cargoPants,
    category: 'men',
    rating: 4.3,
    reviews: 56,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['khaki', 'black', 'olive'],
  },
  {
    id: '4',
    name: 'جاكيت منفوخ',
    price: 12000,
    image: pufferJacket,
    category: 'women',
    discount: 15,
    rating: 4.8,
    reviews: 203,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['red', 'black', 'navy'],
  },
  {
    id: '5',
    name: 'حذاء رياضي ذهبي',
    price: 14000,
    image: sneakersGold,
    category: 'women',
    rating: 4.6,
    reviews: 112,
    sizes: ['36', '37', '38', '39', '40'],
    colors: ['gold', 'silver', 'white'],
  },
  {
    id: '6',
    name: 'حذاء أبيض كلاسيكي',
    price: 9500,
    image: sneakersWhite,
    category: 'new',
    rating: 4.4,
    reviews: 78,
    sizes: ['38', '39', '40', '41', '42'],
    colors: ['white', 'cream'],
  },
];

export const categories = [
  { id: 'all', label: 'All', labelEn: 'All' },
  { id: 'men', label: 'Men', labelEn: 'Men' },
  { id: 'women', label: 'Women', labelEn: 'Women' },
  { id: 'kids', label: 'Kids', labelEn: 'Kids' },
  { id: 'new', label: 'New', labelEn: 'New' },
  { id: 'sale', label: 'Sale', labelEn: 'Sale' },
];