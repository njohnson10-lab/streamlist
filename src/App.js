import React, { useState, useEffect } from 'react';
import { Film, Trash2, Search, Play, Tv, Star, ListVideo, Plus } from 'lucide-react';

// Custom hook to manage localStorage
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error("Error reading localStorage", error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error("Error setting localStorage", error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

export default function App() {
  // Use localStorage instead of standard useState for persistence
  const [movies, setMovies] = useLocalStorage('streamlist_movies', []);
  const [currentRoute, setCurrentRoute] = useState('home'); // 'home' or 'search'

  const deleteMovie = (id) => {
    setMovies(movies.filter(m => m.id !== id));
  };

  const toggleWatched = (id) => {
    setMovies(movies.map(m => m.id === id ? { ...m, watched: !m.watched } : m));
  };

  const addMovie = (movie) => {
    if (!movies.some(m => m.id === movie.id)) {
      setMovies([movie, ...movies]);
    }
  };

  return (
    <div className="min-h-screen bg-[#05080f] text-slate-200 font-sans">
      {/* Navigation Bar */}
      <header className="border-b border-cyan-900/30 bg-[#0b0e14] sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-cyan-500/10 p-2 rounded-xl">
              <Film className="w-6 h-6 text-cyan-400" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Stream<span className="text-cyan-400">List</span></h1>
          </div>
          
          <nav className="flex gap-4">
            <button 
              onClick={() => setCurrentRoute('home')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${currentRoute === 'home' ? 'bg-cyan-500 text-slate-900' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            >
              My Watchlist
            </button>
            <button 
              onClick={() => setCurrentRoute('search')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${currentRoute === 'search' ? 'bg-cyan-500 text-slate-900' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            >
              TMDB Search
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {currentRoute === 'home' ? (
          <WatchlistPage movies={movies} toggleWatched={toggleWatched} deleteMovie={deleteMovie} />
        ) : (
          <TmdbSearchPage onAddMovie={addMovie} />
        )}
      </main>
    </div>
  );
}

// Route 1: The Watchlist
function WatchlistPage({ movies, toggleWatched, deleteMovie }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-white">Your Saved Movies</h2>
        <div className="flex gap-2 text-sm">
          <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
            {movies.filter(m => !m.watched).length} To Watch
          </span>
        </div>
      </div>

      {movies.length === 0 ? (
        <div className="text-center py-20 bg-[#0b0e14] border border-slate-800/50 rounded-2xl border-dashed">
          <Film className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-300 mb-2">Your watchlist is empty</h3>
          <p className="text-slate-500">Go to the TMDB Search tab to find and add movies.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {movies.map((movie) => (
            <div 
              key={movie.id} 
              className={`bg-[#0b0e14] border rounded-xl p-5 flex flex-col transition-all duration-300 ${
                movie.watched ? 'border-slate-800/50 opacity-75' : 'border-slate-700 hover:border-cyan-500/30 shadow-lg'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className={`text-lg font-semibold tracking-tight ${movie.watched ? 'text-slate-400 line-through' : 'text-white'}`}>
                  {movie.title}
                </h3>
                <div className="flex gap-2 ml-4 shrink-0">
                  <button 
                    onClick={() => toggleWatched(movie.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      movie.watched ? 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30' : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    <Play className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => deleteMovie(movie.id)}
                    className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-slate-400 line-clamp-3 mt-auto">
                {movie.summary}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Route 2: TMDB API Search Page
function TmdbSearchPage({ onAddMovie }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');

  // IMPORTANT: Replace this with your actual TMDB API Key for the assignment
  const TMDB_API_KEY = 'e480fcce98e1db5fca26f4ee3218d147'; 

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    if (TMDB_API_KEY === 'YOUR_TMDB_API_KEY_HERE') {
      setError('Please add your TMDB API key in the code to fetch real data.');
      // Mock data for demonstration until API key is added
      setResults([
        { id: 101, title: query + " (Mock Result 1)", overview: "This is mock data. Add your TMDB API key to see real results." },
        { id: 102, title: query + ": The Sequel", overview: "Another mock result to show the layout." }
      ]);
      return;
    }

    setIsSearching(true);
    setError('');

    try {
      const response = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (data.results) {
        setResults(data.results);
      } else {
        setResults([]);
      }
    } catch (err) {
      setError('Failed to fetch data from TMDB. Check your API key or network connection.');
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold text-white mb-6">Search The Movie Database (TMDB)</h2>
      
      <form onSubmit={handleSearch} className="flex gap-2 mb-8">
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a movie..." 
          className="flex-grow bg-[#1e293b] border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
        />
        <button 
          type="submit"
          disabled={isSearching}
          className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold py-3 px-6 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          <Search className="w-5 h-5" />
          {isSearching ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && <p className="text-amber-400 mb-4 bg-amber-400/10 p-3 rounded-lg border border-amber-400/20">{error}</p>}

      <div className="space-y-4">
        {results.map((movie) => (
          <div key={movie.id} className="bg-[#0b0e14] border border-slate-700 rounded-xl p-5 flex justify-between items-center gap-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">{movie.title}</h3>
              <p className="text-sm text-slate-400 line-clamp-2">{movie.overview}</p>
            </div>
            <button 
              onClick={() => {
                onAddMovie({
                  id: movie.id.toString(),
                  title: movie.title,
                  summary: movie.overview,
                  watched: false,
                  genre: 'TMDB Import',
                  platform: 'Unknown',
                  rating: 0
                });
                alert(`${movie.title} added to watchlist!`);
              }}
              className="shrink-0 bg-slate-800 hover:bg-cyan-500 hover:text-slate-900 text-cyan-400 font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}