import { useState } from "react";
import { useReviews } from "@/hooks/useReviews";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  imdbId: string;
}

export default function ReviewSection({ imdbId }: Props) {
  const { user } = useAuth();
  const { reviews, loading, addReview, deleteReview } = useReviews(imdbId);
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content || rating < 1 || rating > 10) return;
    await addReview(content, rating);
    setContent("");
    setRating(0);
  };

  return (
    <div className="space-y-4 mt-6">
      <h2 className="text-xl font-semibold">User Reviews</h2>

      {loading ? (
        <p className="text-gray-400">Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <p className="text-gray-400">No reviews yet. Be the first!</p>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <Card key={review.id} className="bg-slate-900 text-white">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg">⭐ {review.rating}/10</span>
                  {review.user_id === user?.id && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteReview(review.id)}
                    >
                      Delete
                    </Button>
                  )}
                </div>
                <p className="mt-2 text-gray-300">{review.content}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(review.created_at).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {user && (
        <form onSubmit={handleSubmit} className="space-y-2 mt-4">
          <Textarea
            placeholder="Write your review..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <Input
            type="number"
            min={1}
            max={10}
            placeholder="Rating (1-10)"
            value={rating}
            onChange={(e) => setRating(parseInt(e.target.value))}
          />
          <Button type="submit">Submit Review</Button>
        </form>
      )}
    </div>
  );
}
