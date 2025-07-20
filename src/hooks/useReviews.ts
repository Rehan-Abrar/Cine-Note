import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface Review {
  id: string;
  imdb_id: string;
  user_id: string;
  content: string;
  rating: number;
  created_at: string;
  updated_at: string;
}

export function useReviews(imdbId: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("imdb_id", imdbId)
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error fetching reviews", description: error.message });
    } else {
      setReviews(data);
    }

    setLoading(false);
  };

  const addReview = async (content: string, rating: number) => {
    if (!user) return;

    const { error } = await supabase.from("reviews").insert({
      imdb_id: imdbId,
      user_id: user.id,
      content,
      rating,
    });

    if (error) {
      toast({ title: "Error adding review", description: error.message });
    } else {
      toast({ title: "Review added!" });
      fetchReviews();
    }
  };

  const deleteReview = async (id: string) => {
    const { error } = await supabase.from("reviews").delete().eq("id", id);

    if (error) {
      toast({ title: "Error deleting review", description: error.message });
    } else {
      toast({ title: "Review deleted" });
      fetchReviews();
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [imdbId]);

  return { reviews, loading, addReview, deleteReview };
}
