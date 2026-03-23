import React, { useState, useEffect } from 'react';
import { Film, Trash2, Search, Play, Plus, AlertCircle, CheckCircle2 } from 'lucide-react';

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
  const [movies, setMovies] = useLocalStorage('streamlist_movies', []);
  const [currentRoute, setCurrentRoute] = useState('home'); 
  const [notification, setNotification] = useState(null);

  // Auto-hide notifications after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const deleteMovie = (id) => {
    setMovies(movies.filter(m => m.id !== id));
  };

  const toggleWatched = (id) => {
    setMovies(movies.map(m => m.id === id ? { ...m, watched: !m.watched } : m));
  };

  const addMovie = (movie) => {
    if (!movies.some(m => m.id === movie.id)) {
      setMovies([movie, ...movies]);
      setNotification(`${movie.title} added to list!`);
    } else {
      setNotification(`"${movie.title}" is already in your list.`);
    }
  };

  return (
    <div className="min-h-screen bg-[#05080f] text-slate-200 font-sans selection:bg-cyan-500/30">
      {/* Notification Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className="bg-cyan-500 text-[#05080f] px-6 py-3 rounded-xl font-bold shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center gap-2">
            <CheckCircle2 size={18} />
            {notification}
          </div>
        </div>
      )}

      {/* Navigation Bar */}
      <header className="border-b border-cyan-900/30 bg-[#0b0e14]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-cyan-500/20 p-2 rounded-xl border border-cyan-500/30">
              <Film className="w-6 h-6 text-cyan-400" />
            </div>
            <h1 className="text-2xl font-black tracking-tighter text-white uppercase">
              Stream<span className="text-cyan-400">List</span>
            </h1>
          </div>
          
          <nav className="flex bg-[#161b22] p-1 rounded-xl border border-slate-800">
            <button 
              onClick={() => setCurrentRoute('home')}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg font-bold text-sm transition-all ${
                currentRoute === 'home' 
                ? 'bg-cyan-500 text-[#05080f] shadow-[0_0_15px_rgba(6,182,212,0.3)]' 
                : 'text-slate-400 hover:text-white'
              }`}
            >
              My Watchlist
            </button>
            <button 
              onClick={() => setCurrentRoute('search')}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg font-bold text-sm transition-all ${
                currentRoute === 'search' 
                ? 'bg-cyan-500 text-[#05080f] shadow-[0_0_15px_rgba(6,182,212,0.3)]' 
                : 'text-slate-400 hover:text-white'
              }`}
            >
              <Search size={16} />
              TMDB Search
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        {currentRoute === 'home' ? (
          <WatchlistPage movies={movies} toggleWatched={toggleWatched} deleteMovie={deleteMovie} />
        ) : (
          <TmdbSearchPage onAddMovie={addMovie} />
        )}
      </main>

      <footer className="max-w-6xl mx-auto px-6 pb-12 pt-6 border-t border-slate-900 flex justify-between items-center text-slate-600 text-xs">
        <p>© 2026 Nicholas Johnson • INT499 Capstone</p>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
          Local Storage Active
        </div>
      </footer>
    </div>
  );
}

function WatchlistPage({ movies, toggleWatched, deleteMovie }) {
  const unwatchedCount = movies.filter(m => !m.watched).length;

  return (
    <div className="transition-all duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white mb-1">Your Library</h2>
          <p className="text-slate-500 font-medium">Tracking {movies.length} titles</p>
        </div>
        <div className="bg-cyan-500/10 border border-cyan-500/20 px-4 py-2 rounded-xl">
          <span className="text-cyan-400 font-bold text-sm">
            {unwatchedCount} To Watch
          </span>
        </div>
      </div>

      {movies.length === 0 ? (
        <div className="text-center py-24 bg-[#0b0e14] border-2 border-slate-800/50 rounded-3xl border-dashed">
          <Film className="w-16 h-16 text-slate-700 mx-auto mb-6" />
          <h3 className="text-xl font-bold text-slate-300 mb-2">The list is empty</h3>
          <p className="text-slate-500 max-w-xs mx-auto">Head over to the TMDB Search tab to start building your collection.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {movies.map((movie) => (
            <div 
              key={movie.id} 
              className={`group bg-[#0b0e14] border rounded-2xl p-6 flex flex-col transition-all duration-300 relative overflow-hidden ${
                movie.watched 
                ? 'border-slate-800 opacity-60' 
                : 'border-slate-800 hover:border-cyan-500/40 hover:bg-[#11161d]'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                   <span className="text-[10px] uppercase tracking-widest text-cyan-500/70 font-black mb-1 block">Watchlist Entry</span>
                  <h3 className={`text-xl font-bold leading-tight ${movie.watched ? 'text-slate-500 line-through' : 'text-white'}`}>
                    {movie.title}
                  </h3>
                </div>
                <div className="flex gap-2 ml-4 shrink-0">
                  <button 
                    onClick={() => toggleWatched(movie.id)}
                    className={`p-2.5 rounded-xl transition-all ${
                      movie.watched 
                      ? 'bg-cyan-500 text-[#05080f]' 
                      : 'bg-[#1e252e] text-slate-400 hover:text-white'
                    }`}
                  >
                    <Play className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => deleteMovie(movie.id)}
                    className="p-2.5 rounded-xl bg-[#1e252e] text-slate-400 hover:text-red-400 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-slate-400 line-clamp-3 leading-relaxed">
                {movie.summary || "No description provided."}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TmdbSearchPage({ onAddMovie }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');

  const TMDB_API_KEY = 'e480fcce98e1db5fca26f4ee3218d147'; 

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

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
      setError('Failed to fetch from TMDB. Please check your network.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-10 text-center sm:text-left">
        <h2 className="text-3xl font-bold text-white mb-2">Explore Movies</h2>
        <p className="text-slate-500">Find and sync titles with your personal collection.</p>
      </div>
      
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-12">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search movie title..." 
            className="w-full bg-[#0b0e14] border-2 border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-all"
          />
        </div>
        <button 
          type="submit"
          disabled={isSearching}
          className="bg-cyan-500 hover:bg-cyan-400 text-[#05080f] font-black py-4 px-8 rounded-2xl transition-all disabled:opacity-50"
        >
          {isSearching ? '...' : 'Search'}
        </button>
      </form>

      {error && (
        <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-sm">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <div className="space-y-4">
        {results.map((movie) => (
          <div key={movie.id} className="bg-[#0b0e14] border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-center gap-6 transition-all group">
            <div className="flex-grow">
              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">{movie.title}</h3>
              <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">{movie.overview || "No summary available."}</p>
            </div>
            <button 
              onClick={() => onAddMovie({
                  id: movie.id.toString(),
                  title: movie.title,
                  summary: movie.overview,
                  watched: false
              })}
              className="shrink-0 bg-[#1e252e] hover:bg-cyan-500 hover:text-[#05080f] text-cyan-400 font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-all border border-slate-700/50"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}