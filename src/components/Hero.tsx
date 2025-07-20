import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Play, Star } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import heroBackground from "@/assets/hero-background.jpg";

interface HeroProps {
  onSearch?: (query: string) => void;
}

const Hero = ({ onSearch }: HeroProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate(); // ✅ Added navigation

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && onSearch) {
      onSearch(searchQuery.trim());
    }
  };




  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBackground})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/95" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center animate-fade-in">
        {/* Logo/Brand */}
        <div className="flex items-center justify-center mb-8">
          <div className="bg-gradient-primary p-4 rounded-2xl shadow-glow animate-glow-pulse">
            <Play className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent ml-4">
            CineNote
          </h1>
        </div>

        {/* Tagline */}
        <p className="text-xl md:text-2xl text-muted-foreground mb-4 max-w-2xl mx-auto">
          Track what you watch, share what you think
        </p>
        <p className="text-lg text-muted-foreground/80 mb-12 max-w-xl mx-auto">
          Discover, organize, and review your favorite movies and TV shows
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search for movies and TV shows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input pl-12 pr-4 py-4 text-lg h-auto"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          </div>
        </form>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            className="btn-primary text-lg px-8 py-4 h-auto"
            onClick={() => navigate('/watchlist')} // ✅ Redirect to Watchlist page
          >
            Start Your Watchlist
          </Button>
          
          <Button
            variant="outline"
            className="text-lg px-8 py-4 h-auto border-2 border-muted-foreground/30 hover:border-primary transition-smooth"
            onClick={() => navigate("/top-picks")}
          >
            Our Top Picks
          </Button>



        </div>



        {/* Stats */}
        <div className="flex justify-center items-center gap-8 mt-16 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-accent" />
            <span>Track & Rate</span>
          </div>
          <div className="h-4 w-px bg-muted-foreground/30" />
          <div className="flex items-center gap-2">
            <Play className="h-4 w-4 text-secondary" />
            <span>Discover New</span>
          </div>
          <div className="h-4 w-px bg-muted-foreground/30" />
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-primary" />
            <span>Review & Share</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
