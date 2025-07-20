import { useState } from 'react';
import { Star, Play, Calendar, MessageSquare } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import WatchlistButton from './WatchlistButton';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface MovieCardProps {
  title: string;
  year: string;
  poster: string;
  type: 'movie' | 'series';
  rating?: number;
  imdbId: string;
}

const MovieCard = ({
  title,
  year,
  poster,
  type,
  rating,
  imdbId
}: MovieCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="movie-card group cursor-pointer animate-scale-in"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Poster Container */}
      <div className="relative aspect-[2/3] rounded-xl mb-4 overflow-visible z-0">
        <img
          src={poster !== 'N/A' ? poster : '/placeholder.svg'}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
          loading="lazy"
        />

        {/* Hover Overlay */}
        {isHovered && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end p-4 animate-fade-in z-20 overflow-visible">
            <div className="flex flex-col gap-2 w-full relative z-30">
              <WatchlistButton imdbId={imdbId} movieTitle={title} />
              <Link to={`/reviews/${imdbId}`} className="w-full">
                <Button
                  variant="secondary"
                  className="w-full bg-white/90 text-black hover:bg-white"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Add Review
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Type Badge */}
        <div className="absolute top-3 left-3 z-40">
          <Badge variant="secondary" className="bg-background/90 text-foreground">
            {type === 'movie' ? (
              <>
                <Play className="h-3 w-3 mr-1" />
                Movie
              </>
            ) : (
              <>
                <Calendar className="h-3 w-3 mr-1" />
                Series
              </>
            )}
          </Badge>
        </div>

        {/* Rating Badge */}
        {rating !== undefined && (
          <div className="absolute top-3 right-3 z-40">
            <Badge className="bg-gradient-primary text-white">
              <Star className="h-3 w-3 mr-1 fill-current" />
              {rating.toFixed(1)}
            </Badge>
          </div>
        )}
      </div>

      {/* Movie Info */}
      <div className="space-y-2">
        <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground">{year}</p>
      </div>
    </div>
  );
};

export default MovieCard;
