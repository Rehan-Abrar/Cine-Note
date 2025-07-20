// src/components/ReviewForm.tsx

import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface Props {
  imdbId: string;
  onReviewAdded: () => void;
}

export default function ReviewForm({ imdbId, onReviewAdded }: Props) {
  const { user } = useAuth();
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
