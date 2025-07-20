import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export type WatchlistStatus = 'Plan to Watch' | 'Watching' | 'Completed';

interface WatchlistItem {
  id: string;
  imdb_id: string;
  status: WatchlistStatus;
  added_at: string;
  updated_at: string;
}

export const useWatchlist = () => {
  const [watchlistItems, setWatchlistItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch user's watchlist
  const fetchWatchlist = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('watchlist')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setWatchlistItems((data || []) as WatchlistItem[]);
    } catch (error) {
      console.error('Error fetching watchlist:', error);
    }
  };

  // Add item to watchlist
  const addToWatchlist = async (imdbId: string, status: WatchlistStatus = 'Plan to Watch') => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to add items to your watchlist",
        variant: "destructive"
      });
      return false;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('watchlist')
        .insert({
          user_id: user.id,
          imdb_id: imdbId,
          status: status
        })
        .select()
        .single();

      if (error) throw error;
      
      setWatchlistItems(prev => [...prev, data as WatchlistItem]);
      toast({
        title: "Added to watchlist",
        description: `Movie added as "${status}"`,
      });
      return true;
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      toast({
        title: "Error",
        description: "Failed to add to watchlist",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update watchlist item status
  const updateWatchlistStatus = async (imdbId: string, status: WatchlistStatus) => {
    if (!user) return false;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('watchlist')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('imdb_id', imdbId)
        .select()
        .single();

      if (error) throw error;
      
      setWatchlistItems(prev => 
        prev.map(item => 
          item.imdb_id === imdbId ? { ...item, status, updated_at: data.updated_at } : item
        )
      );
      
      toast({
        title: "Status updated",
        description: `Updated to "${status}"`,
      });
      return true;
    } catch (error) {
      console.error('Error updating watchlist:', error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Remove from watchlist
  const removeFromWatchlist = async (imdbId: string) => {
    if (!user) return false;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('watchlist')
        .delete()
        .eq('user_id', user.id)
        .eq('imdb_id', imdbId);

      if (error) throw error;
      
      setWatchlistItems(prev => prev.filter(item => item.imdb_id !== imdbId));
      toast({
        title: "Removed from watchlist",
        description: "Movie removed from your watchlist",
      });
      return true;
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      toast({
        title: "Error",
        description: "Failed to remove from watchlist",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Check if item is in watchlist
  const getWatchlistItem = (imdbId: string) => {
    return watchlistItems.find(item => item.imdb_id === imdbId);
  };

  // Initialize watchlist on mount and user change
  useEffect(() => {
    fetchWatchlist();
  }, [user]);

  return {
    watchlistItems,
    loading,
    addToWatchlist,
    updateWatchlistStatus,
    removeFromWatchlist,
    getWatchlistItem,
    fetchWatchlist
  };
};