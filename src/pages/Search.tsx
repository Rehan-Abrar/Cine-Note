import Navbar from '@/components/Navbar';
import SearchResults from '@/components/SearchResults';

const Search = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <SearchResults />
    </div>
  );
};

export default Search;