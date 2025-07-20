import { useEffect, useState } from "react";
import { OMDBApi, OMDBMovie } from "@/lib/omdb";
import MovieCard from "@/components/MovieCard";
import Navbar from "@/components/Navbar"; // ✅ Add this import

const TOP_PICK_TITLES = [
  "Forgotten",
  "Her",
  "Atonement",
  "Death's Game",
  "Requiem for a Dream",
  "La La Land",
  "Manchester by the Sea",
  "Eternal Sunshine of the Spotless Mind",
  "Shoplifters",
  "Prisoners",
  "Dead Poets Society",
  "Monster",
  "Good Will Hunting",
  "Oldboy",
  "My Mister",
];

const TopPicks = () => {
  const [movies, setMovies] = useState<OMDBMovie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const results: OMDBMovie[] = [];

      for (const title of TOP_PICK_TITLES) {
        const data = await OMDBApi.getMovieByTitle(title);
        if (data && data.Response === "True") {
          results.push(data);
        }
      }

      setMovies(results);
      setLoading(false);
    };

    fetchAll();
  }, []);

  return (
    <>
      <Navbar /> {/* ✅ Use your global navbar at the top */}

      <div className="p-6">
        <h1 className="text-2xl text-white font-semibold mb-4">Our Top Picks</h1>

        {loading ? (
          <p className="text-white text-center">Loading top picks...</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {movies.map((movie) => (
              <MovieCard
                key={movie.imdbID}
                title={movie.Title}
                year={movie.Year}
                poster={movie.Poster}
                type={movie.Type === "series" ? "series" : "movie"}
                imdbId={movie.imdbID}
                rating={Number(movie.imdbRating) || undefined}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default TopPicks;
