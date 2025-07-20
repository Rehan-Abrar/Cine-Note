import { useState, useEffect } from 'react';
import { BookOpen, Filter } from 'lucide-react';
import Navbar from '@/components/Navbar';
import MovieCard from '@/components/MovieCard';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useWatchlist, WatchlistStatus } from '@/hooks/useWatchlist';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { OMDBApi } from '@/lib/omdb';

interface MovieDetails {
  imdbID: string;
  Title: string;
  Year: string;
  Poster: string;
  Type: 'movie' | 'series';
  imdbRating?: string;
}

const Watchlist = () => {
  const { user } = useAuth();
  const { watchlistItems, fetchWatchlist } = useWatchlist();
  const [movieDetails, setMovieDetails] = useState<Record<string, MovieDetails>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchWatchlist();
    }
  }, [user]);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      if (watchlistItems.length === 0) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const details: Record<string, MovieDetails> = {};
      
      for (const item of watchlistItems) {
        try {
          const response = await OMDBApi.getMovieDetails(item.imdb_id);
          if (response.Response === 'True') {
            details[item.imdb_id] = {
              imdbID: response.imdbID,
              Title: response.Title,
              Year: response.Year,
              Poster: response.Poster,
              Type: response.Type as 'movie' | 'series',
              imdbRating: response.imdbRating
            };
          }
        } catch (error) {
          console.error('Error fetching movie details:', error);
        }
      }
      
      setMovieDetails(details);
      setLoading(false);
    };

    fetchMovieDetails();
  }, [watchlistItems]);

  const getFilteredItems = (status: WatchlistStatus) => {
    return watchlistItems.filter(item => item.status === status);
  };

  const renderMovieGrid = (status: WatchlistStatus) => {
    const filteredItems = getFilteredItems(status);
    
    if (filteredItems.length === 0) {
      return (
        <Card className="bg-card border-border shadow-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle className="text-lg mb-2">No {status.toLowerCase()} movies</CardTitle>
            <CardDescription className="text-center">
              Movies marked as "{status}" will appear here
            </CardDescription>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {filteredItems.map((item) => {
          const movie = movieDetails[item.imdb_id];
          if (!movie) return null;
          
          return (
            <MovieCard
              key={item.id}
              title={movie.Title}
              year={movie.Year}
              poster={movie.Poster}
              type={movie.Type}
              rating={movie.imdbRating ? parseFloat(movie.imdbRating) : undefined}
              imdbId={movie.imdbID}
            />
          );
        })}
      </div>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="min-h-screen bg-gradient-dark py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="bg-card border-border shadow-card">
              <CardContent className="flex flex-col items-center justify-center py-20">
                <BookOpen className="h-16 w-16 text-muted-foreground mb-6" />
                <CardTitle className="text-2xl mb-4">Login Required</CardTitle>
                <CardDescription className="text-center mb-6">
                  Please login to view your watchlist
                </CardDescription>
                <Button 
                  onClick={() => window.location.href = '/auth'}
                  className="btn-primary"
                >
                  Login / Sign Up
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="min-h-screen bg-gradient-dark py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              My Watchlist
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Organize your movies and shows by status
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-card border-border shadow-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Plan to Watch</CardTitle>
                <div className="w-3 h-3 rounded-full bg-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{getFilteredItems('Plan to Watch').length}</div>
              </CardContent>
            </Card>
            
            <Card className="bg-card border-border shadow-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Watching</CardTitle>
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{getFilteredItems('Watching').length}</div>
              </CardContent>
            </Card>
            
            <Card className="bg-card border-border shadow-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{getFilteredItems('Completed').length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Content Tabs */}
          <Tabs defaultValue="plan-to-watch" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="plan-to-watch">Plan to Watch</TabsTrigger>
              <TabsTrigger value="watching">Watching</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>

            <TabsContent value="plan-to-watch" className="space-y-6">
              {loading ? (
                <div className="text-center py-20">
                  <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading your watchlist...</p>
                </div>
              ) : (
                renderMovieGrid('Plan to Watch')
              )}
            </TabsContent>

            <TabsContent value="watching" className="space-y-6">
              {loading ? (
                <div className="text-center py-20">
                  <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading your watchlist...</p>
                </div>
              ) : (
                renderMovieGrid('Watching')
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-6">
              {loading ? (
                <div className="text-center py-20">
                  <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading your watchlist...</p>
                </div>
              ) : (
                renderMovieGrid('Completed')
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Watchlist;