import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';

const Index = () => {
  const [searchParams] = useSearchParams();

  const handleSearch = (query: string) => {
    // Redirect to search page with query
    window.location.href = `/search?search=${encodeURIComponent(query)}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero onSearch={handleSearch} />
    </div>
  );
};

export default Index;
