// src/components/ReviewForm.tsx

import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn, UserPlus } from "lucide-react";

interface Props {
  imdbId: string;
  onReviewAdded: () => void;
}

export default function ReviewForm({ imdbId, onReviewAdded }: Props) {
  const { user, loading } = useAuth();
  const { toast } = useToast();

  const [content, setContent] = useState("");
  const [rating, setRating] = useState<number | undefined>();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !imdbId || !content || rating === undefined) {
      toast({ title: "Please complete all fields." });
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("reviews").insert([
      {
        imdb_id: imdbId,
        user_id: user.id,
        content,
        rating,
      },
    ]);

    setSubmitting(false);

    if (error) {
      toast({ title: "Failed to submit review." });
    } else {
      toast({ title: "Review submitted!" });
      setContent("");
      setRating(undefined);
      onReviewAdded(); // refetch reviews
    }
  };

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="space-y-4 mb-10">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
          <div className="h-20 bg-muted rounded mb-4"></div>
          <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
          <div className="h-10 bg-muted rounded mb-4"></div>
        </div>
      </div>
    );
  }

  // Show login prompt if user is not authenticated
  if (!user) {
    return (
      <Card className="mb-10">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <LogIn className="h-5 w-5" />
            Sign In Required
          </CardTitle>
          <CardDescription>
            You need to be signed in to write a review for this movie.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link to="/login" className="flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              Sign In
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/signup" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Create Account
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Show the original form for authenticated users
  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-10">
      <div>
        <Label>Review</Label>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your thoughts..."
          className="text-foreground"
        />
      </div>
      <div>
        <Label>Rating (0-10)</Label>
        <Input
          type="number"
          min={0}
          max={10}
          value={rating ?? ""}
          onChange={(e) => setRating(Number(e.target.value))}
          className="text-foreground"
        />
      </div>
      <Button type="submit" disabled={submitting}>
        Submit Review
      </Button>
    </form>
  );
}