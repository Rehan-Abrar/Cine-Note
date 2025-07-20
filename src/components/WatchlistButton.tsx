import { useState, useEffect, useRef } from 'react';
import { Plus, Check, ChevronDown } from 'lucide-react';
import { useWatchlist, WatchlistStatus } from '@/hooks/useWatchlist';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface WatchlistButtonProps {
  imdbId: string;
  movieTitle: string;
}

const watchlistOptions: { value: WatchlistStatus; label: string; color: string }[] = [
  { value: 'Plan to Watch', label: 'Plan to Watch', color: 'bg-blue-500' },
  { value: 'Watching', label: 'Watching', color: 'bg-yellow-500' },
  { value: 'Completed', label: 'Completed', color: 'bg-green-500' },
];

const WatchlistButton = ({ imdbId, movieTitle }: WatchlistButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { getWatchlistItem, addToWatchlist, updateWatchlistStatus, removeFromWatchlist, loading } = useWatchlist();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('✅ WatchlistButton mounted');

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const watchlistItem = getWatchlistItem(imdbId);
  const isInWatchlist = !!watchlistItem;

  const ensureAuthenticated = () => {
    if (!user) {
      navigate('/login');
      return false;
    }
    return true;
  };

  const handleAddToWatchlist = async (status: WatchlistStatus) => {
    console.log('Adding:', status);
    if (!ensureAuthenticated()) return;
    const success = await addToWatchlist(imdbId, status);
    if (success) setIsOpen(false);
  };

  const handleUpdateStatus = async (status: WatchlistStatus) => {
    if (!ensureAuthenticated()) return;
    const success = await updateWatchlistStatus(imdbId, status);
    if (success) setIsOpen(false);
  };

  const handleRemoveFromWatchlist = async () => {
    if (!ensureAuthenticated()) return;
    const success = await removeFromWatchlist(imdbId);
    if (success) setIsOpen(false);
  };

  const getCurrentStatusColor = () => {
    if (!watchlistItem) return '';
    const option = watchlistOptions.find(opt => opt.value === watchlistItem.status);
    return option?.color || '';
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <Button
        onClick={() => setIsOpen(prev => !prev)}
        className={`w-full ${isInWatchlist
          ? `${getCurrentStatusColor()} text-white hover:opacity-80`
          : 'btn-primary'
          }`}
        disabled={loading}
      >
        {isInWatchlist ? (
          <>
            <Check className="h-4 w-4 mr-2" />
            {watchlistItem.status}
            <ChevronDown className="h-4 w-4 ml-2" />
          </>
        ) : (
          <>
            <Plus className="h-4 w-4 mr-2" />
            Add to Watchlist
            <ChevronDown className="h-4 w-4 ml-2" />
          </>
        )}
      </Button>

      {isOpen && (
        <div className="absolute z-[9999] mt-2 w-56 rounded-md shadow-lg bg-white border border-slate-300">
        <div className="py-1">
            {(isInWatchlist ? watchlistOptions : watchlistOptions).map(option => (
              <button
                key={option.value}
                onClick={() =>
                  isInWatchlist
                    ? handleUpdateStatus(option.value)
                    : handleAddToWatchlist(option.value)
                }
                className="flex items-center w-full px-4 py-2 text-sm text-black dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                <div className={`w-3 h-3 rounded-full ${option.color} mr-2`} />
                {option.label}
              </button>
            ))}

            {isInWatchlist && (
              <>
                <div className="border-t my-1 border-slate-300 dark:border-slate-600" />
                <button
                  onClick={handleRemoveFromWatchlist}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-100 dark:hover:bg-red-800 dark:text-red-400"
                >
                  Remove from Watchlist
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WatchlistButton;
