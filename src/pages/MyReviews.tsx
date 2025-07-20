import { useState, useEffect } from 'react';
import { Star, MessageSquare, Edit, Trash2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { OMDBApi } from '@/lib/omdb';

interface Review {
  id: string;
  imdb_id: string;
  rating: number | null;
  content: string;
  created_at: string;
  updated_at: string;
}

interface MovieDetails {
  Title: string;
  Year: string;
  Poster: string;
  Type: 'movie' | 'series';
}

const Reviews = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [movieDetails, setMovieDetails] = useState<Record<string, MovieDetails>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchReviews();
  }, [user]);

  const fetchReviews = async () => {
    if (!user) return;
    setLoading(true);

    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setReviews(data);

      const details: Record<string, MovieDetails> = {};
      for (const review of data) {
        try {
          const res = await OMDBApi.getMovieDetails(review.imdb_id);
          if (res.Response === 'True') {
            details[review.imdb_id] = {
              Title: res.Title,
              Year: res.Year,
              Poster: res.Poster,
              Type: res.Type as 'movie' | 'series'
            };
          }
        } catch (err) {
          console.error(err);
        }
      }
      setMovieDetails(details);
    }

    setLoading(false);
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  const handleEdit = async (review: Review) => {
    const newContent = prompt("Edit your review:", review.content);
    if (newContent === null) return;

    const newRatingStr = prompt("Edit your rating (0–10):", review.rating?.toString() || "0");
    const newRating = Number(newRatingStr);
    if (isNaN(newRating) || newRating < 0 || newRating > 10) {
      alert("Invalid rating.");
      return;
    }

    const { error } = await supabase
      .from("reviews")
      .update({ content: newContent, rating: newRating, updated_at: new Date().toISOString() })
      .eq("id", review.id);

    if (error) {
      alert("Failed to update review.");
    } else {
      fetchReviews();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) {
      alert("Failed to delete review.");
    } else {
      setReviews(reviews.filter((r) => r.id !== id));
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="min-h-screen bg-gradient-dark py-20">
          <div className="max-w-4xl mx-auto px-4">
            <Card className="bg-card border-border shadow-card">
              <CardContent className="flex flex-col items-center py-20">
                <MessageSquare className="h-16 w-16 text-muted-foreground mb-6" />
                <CardTitle className="text-2xl mb-4">Login Required</CardTitle>
                <CardDescription className="text-center mb-6">
                  Please login to view your reviews
                </CardDescription>
                <Button onClick={() => (window.location.href = '/auth')} className="btn-primary">
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
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              My Reviews
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Your thoughts and ratings on movies and shows
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="bg-card border-border shadow-card">
              <CardHeader className="flex items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reviews.length}</div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border shadow-card">
              <CardHeader className="flex items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {reviews.length
                    ? (
                        reviews
                          .filter((r) => r.rating !== null)
                          .reduce((sum, r) => sum + (r.rating || 0), 0) /
                        reviews.filter((r) => r.rating !== null).length
                      ).toFixed(1)
                    : "0.0"}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Reviews */}
          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-muted-foreground">Loading your reviews...</p>
            </div>
          ) : reviews.length === 0 ? (
            <Card className="bg-card border-border shadow-card">
              <CardContent className="flex flex-col items-center py-20">
                <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                <CardTitle className="text-lg mb-2">No reviews yet</CardTitle>
                <CardDescription className="text-center mb-6">
                  Start reviewing movies and shows to see them here
                </CardDescription>
                <Button onClick={() => (window.location.href = '/search')} className="btn-primary">
                  Browse Movies
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => {
                const movie = movieDetails[review.imdb_id];
                if (!movie) return null;

                return (
                  <Card key={review.id} className="bg-card border-border shadow-card">
                    <CardContent className="p-6">
                      <div className="flex gap-6">
                        <div className="w-20 flex-shrink-0">
                          <img
                            src={movie.Poster !== "N/A" ? movie.Poster : "/placeholder.svg"}
                            alt={movie.Title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-lg font-semibold text-foreground">{movie.Title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {movie.Year} • {movie.Type === "movie" ? "Movie" : "TV Series"}
                              </p>
                            </div>
                            {review.rating !== null && (
                              <Badge className="bg-gradient-primary text-white">
                                <Star className="h-3 w-3 mr-1 fill-current" />
                                {review.rating}/10
                              </Badge>
                            )}
                          </div>
                          <p className="text-foreground mb-4 leading-relaxed">{review.content}</p>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>Reviewed on {formatDate(review.created_at)}</span>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleEdit(review)}>
                                <Edit className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleDelete(review.id)}
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reviews;
