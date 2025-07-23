import { useState, useEffect, useLayoutEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Grid, List } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import MovieCard from './MovieCard';
import { OMDBApi, OMDBMovie } from '@/lib/omdb';

interface SearchResultsProps {
  initialQuery?: string;
}

const SearchResults = ({ initialQuery = '' }: SearchResultsProps) => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(initialQuery || searchParams.get('search') || '');
  const [movies, setMovies] = useState<OMDBMovie[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Function to determine initial view mode based on screen size
  const getInitialViewMode = (): 'grid' | 'list' => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768 ? 'list' : 'grid'; // 768px is md breakpoint
    }
    return 'grid'; // fallback for SSR
  };

  const [viewMode, setViewMode] = useState<'grid' | 'list'>(getInitialViewMode);
  const [hasManuallySetView, setHasManuallySetView] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const { toast } = useToast();

  // Use layoutEffect to prevent flicker on initial render
  useLayoutEffect(() => {
    if (typeof window !== 'undefined' && !hasManuallySetView) {
      const isMobile = window.innerWidth < 768;
      setViewMode(isMobile ? 'list' : 'grid');
    }
  }, [hasManuallySetView]);

  // Handle media query changes using matchMedia
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(max-width: 767px)');
    
    const handleMediaChange = (e: MediaQueryListEvent) => {
      // Only auto-switch if user hasn't manually set their preference
      if (!hasManuallySetView) {
        setViewMode(e.matches ? 'list' : 'grid');
      }
    };

    mediaQuery.addEventListener('change', handleMediaChange);
    return () => mediaQuery.removeEventListener('change', handleMediaChange);
  }, [hasManuallySetView]);

  useEffect(() => {
    const urlQuery = searchParams.get('search');
    if (urlQuery && urlQuery !== searchQuery) {
      setSearchQuery(urlQuery);
      performSearch(urlQuery);
    } else if (initialQuery && initialQuery !== searchQuery) {
      setSearchQuery(initialQuery);
      performSearch(initialQuery);
    }
  }, [searchParams, initialQuery]);

  const performSearch = async (query: string, page: number = 1) => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const response = await OMDBApi.searchMovies(
        query,
        filterType === 'all' ? undefined : filterType as 'movie' | 'series',
        undefined,
        page
      );

      if (response.Response === 'True') {
        if (page === 1) {
          setMovies(response.Search);
        } else {
          setMovies(prev => [...prev, ...response.Search]);
        }
        setTotalResults(parseInt(response.totalResults));
        setCurrentPage(page);
      } else {
        if (page === 1) {
          setMovies([]);
          setTotalResults(0);
        }
        toast({
          title: "No results found",
          description: response.Error || "Try a different search term",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Search failed",
        description: "Please check your internet connection and try again",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchQuery) {
      setCurrentPage(1);
      performSearch(searchQuery, 1);
    }
  }, [filterType]);
  

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    performSearch(searchQuery);
  };

  const loadMore = () => {
    performSearch(searchQuery, currentPage + 1);
  };

  const hasMoreResults = movies.length < totalResults;

  return (
    <section className="min-h-screen bg-gradient-dark py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Discover Movies & Shows
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Search through millions of titles and add them to your watchlist
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Main Search */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
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

          {/* Filters and View Toggle */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              {/* Type Filter */}
              <Select value={filterType} onValueChange={(value) => setFilterType(value)}>
                <SelectTrigger className="w-32 bg-input border-border">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="movie">Movies</SelectItem>
                  <SelectItem value="series">TV Shows</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => {
                  setViewMode('grid');
                  setHasManuallySetView(true);
                }}
                className="transition-smooth"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => {
                  setViewMode('list');
                  setHasManuallySetView(true);
                }}
                className="transition-smooth"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Results */}
        {loading && movies.length === 0 ? (
          <div className="text-center py-20">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Searching...</p>
          </div>
        ) : movies.length > 0 ? (
          <>
            <div className={`${
              viewMode === 'grid' 
                ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6' 
                : 'space-y-4'
            } animate-fade-in`}>
              {movies.map((movie) => (
                <MovieCard
                  key={movie.imdbID}
                  title={movie.Title}
                  year={movie.Year}
                  poster={movie.Poster}
                  type={movie.Type}
                  rating={movie.imdbRating ? parseFloat(movie.imdbRating) : undefined}
                  imdbId={movie.imdbID}
                />
              ))}
            </div>

            {/* Results Info */}
            <div className="text-center mt-8 text-muted-foreground">
              Showing {movies.length} of {totalResults} results
            </div>

            {/* Load More */}
            {hasMoreResults && (
              <div className="text-center mt-8">
                <Button 
                  onClick={loadMore}
                  disabled={loading}
                  className="btn-primary px-8 py-3"
                >
                  {loading ? 'Loading...' : 'Load More Results'}
                </Button>
              </div>
            )}
          </>
        ) : searchQuery ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">No results found for "{searchQuery}"</p>
            <p className="text-muted-foreground mt-2">Try a different search term</p>
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">Start searching for movies and TV shows</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default SearchResults;