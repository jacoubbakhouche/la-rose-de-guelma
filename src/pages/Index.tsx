import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import ProductGrid from '@/components/ProductGrid';
import BottomNav from '@/components/BottomNav';

import { useState } from 'react';

const Index = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="min-h-screen bg-background">
      <Header onSearch={setSearchTerm} />
      <main>
        <HeroSection />
        <ProductGrid searchTerm={searchTerm} />
      </main>
      {/* BottomNav removed as per request */}
    </div>
  );
};

export default Index;