import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

export interface Review {
  id: string;
  user_id: string;
  imdb_id: string;
  content: string;
  rating: number | null;
  created_at: string;
}

interface Props {
  reviews: Review[];
  loading: boolean;
}

const formatDate = (str: string) =>
  new Date(str).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

export default function ReviewList({ reviews, loading }: Props) {
  if (loading) {
    return <p className="text-muted-foreground">Loading reviews...</p>;
  }

  if (reviews.length === 0) {
    return <p className="text-muted-foreground">No reviews from you yet.</p>;
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <Card key={review.id} className="bg-card border border-border shadow-md">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-3">
              {review.rating !== null && (
                <Badge className="bg-primary text-white flex items-center gap-1">
                  <Star className="w-4 h-4 fill-white" />
                  {review.rating}/10
                </Badge>
              )}
              <span className="text-sm text-muted-foreground">
                {formatDate(review.created_at)}
              </span>
            </div>
            <p className="text-foreground whitespace-pre-line">{review.content}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
