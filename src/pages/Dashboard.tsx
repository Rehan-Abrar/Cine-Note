import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Film, Star, BookOpen, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { OMDBApi } from '@/lib/omdb';

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [movieDetails, setMovieDetails] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!loading && !user) navigate('/auth');
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) fetchUserData();
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;

    const { data: watchlistData } = await supabase
      .from('watchlist')
      .select('*')
      .eq('user_id', user.id);

    const { data: reviewsData } = await supabase
      .from('reviews')
      .select('*')
      .eq('user_id', user.id);

    const combined = [...(watchlistData || []), ...(reviewsData || [])];
    const imdbIds = Array.from(new Set(combined.map(item => item.imdb_id)));

    const details: Record<string, any> = {};
    for (const imdb_id of imdbIds) {
      try {
        const res = await OMDBApi.getMovieDetails(imdb_id);
        if (res?.Response === 'True') {
          details[imdb_id] = res;
        }
      } catch (error) {
        console.error(`Failed to fetch movie ${imdb_id}`, error);
      }
    }

    setWatchlist(watchlistData || []);
    setReviews(reviewsData || []);
    setMovieDetails(details);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
          <p className="text-muted-foreground">Manage your movies and reviews</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-card border-border shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Movies in Watchlist</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{watchlist.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reviews Written</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reviews.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Movies Watched</CardTitle>
              <Film className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {watchlist.filter((item: any) => item.status === 'Completed').length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="watchlist" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="watchlist">My Watchlist</TabsTrigger>
            <TabsTrigger value="reviews">My Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="watchlist" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Your Watchlist</h2>
              <Button className="btn-primary" onClick={() => navigate('/')}>
                <Plus className="h-4 w-4 mr-2" />
                Add Movies
              </Button>
            </div>

            {watchlist.length === 0 ? (
              <Card className="bg-card border-border shadow-card">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                  <CardTitle className="text-lg mb-2">Your watchlist is empty</CardTitle>
                  <CardDescription className="text-center mb-4">
                    Start adding movies you want to watch!
                  </CardDescription>
                  <Button className="btn-primary" onClick={() => navigate('/')}>
                    Discover Movies
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {watchlist.map((item: any) => {
                  const movie = movieDetails[item.imdb_id];
                  return (
                    <Card key={item.id} className="bg-card border-border shadow-card">
                      <CardContent className="p-4">
                        <p className="font-medium">{movie?.Title || item.imdb_id}</p>
                        <p className="text-sm text-muted-foreground">Status: {item.status}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Added: {new Date(item.added_at).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Your Reviews</h2>
            </div>

            {reviews.length === 0 ? (
              <Card className="bg-card border-border shadow-card">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Star className="h-12 w-12 text-muted-foreground mb-4" />
                  <CardTitle className="text-lg mb-2">No reviews yet</CardTitle>
                  <CardDescription className="text-center mb-4">
                    Start reviewing movies you've watched!
                  </CardDescription>
                  <Button className="btn-primary" onClick={() => navigate('/')}>
                    Find Movies to Review
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {reviews.map((review: any) => {
                  const movie = movieDetails[review.imdb_id];
                  return (
                    <Card key={review.id} className="bg-card border-border shadow-card">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-medium">{movie?.Title || review.imdb_id}</p>
                          {review.rating && (
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-accent mr-1" />
                              <span className="text-sm">{review.rating}/10</span>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{review.content}</p>
                        <p className="text-xs text-muted-foreground">
                          Reviewed: {new Date(review.created_at).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
