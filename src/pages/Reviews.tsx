import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import ReviewForm from "@/components/ReviewForm";
import ReviewList, { Review } from "@/components/ReviewList";
import Navbar from "@/components/Navbar";

export default function MovieReviewsPage() {
  const { imdbId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [userReview, setUserReview] = useState<Review | null>(null);
  const [otherReviews, setOtherReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    setLoading(true);

    const { data: reviews, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("imdb_id", imdbId)
      .order("created_at", { ascending: false });

    if (!error && reviews) {
      setUserReview(reviews.find((r) => r.user_id === user?.id) || null);
      setOtherReviews(reviews.filter((r) => r.user_id !== user?.id));
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, [imdbId, user]);

  const handleReviewAdded = () => {
    fetchReviews();
  };

  return (
    <div className="min-h-screen bg-background text-white">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 pt-6">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-muted-foreground hover:text-white transition"
        >
          ← Back
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">
        <h1 className="text-2xl font-bold text-foreground">Reviews</h1>

        <ReviewForm imdbId={imdbId!} onReviewAdded={handleReviewAdded} />

        <div>
          <h2 className="text-xl font-semibold mb-2">Your Review</h2>
          {userReview ? (
            <ReviewList reviews={[userReview]} loading={loading} />
          ) : (
            <p className="text-muted-foreground">
              You haven’t reviewed this movie yet.
            </p>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Reviews from Other Users</h2>
          {loading ? (
            <p className="text-muted-foreground">Loading reviews...</p>
          ) : otherReviews.length > 0 ? (
            <ReviewList reviews={otherReviews} loading={false} />
          ) : (
            <p className="text-muted-foreground">No reviews from other users yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
