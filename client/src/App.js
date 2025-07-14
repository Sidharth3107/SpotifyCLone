import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const API_BASE_URL = 'https://spotifyclone-o4ob.onrender.com';

function App() {
  const [playlists, setPlaylists] = useState([]);
  const [songs, setSongs] = useState([]);
  const [likedSongs, setLikedSongs] = useState([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('home');
  const audioRef = useRef(new Audio());
  const progressRef = useRef(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/songs`)
      .then(res => res.json())
      .then(data => {
        setSongs(data);
        if (data.length > 0) setCurrentSongIndex(0);
      })
      .catch(err => console.error("Error fetching songs:", err));

    fetch(`${API_BASE_URL}/api/playlists`)
      .then(res => res.json())
      .then(data => setPlaylists(data))
      .catch(err => console.error("Error fetching playlists:", err));

    // Load liked songs from localStorage
    const storedLikes = JSON.parse(localStorage.getItem('likedSongs')) || [];
    setLikedSongs(storedLikes);
  }, []);

  useEffect(() => {
    // Save liked songs to localStorage
    localStorage.setItem('likedSongs', JSON.stringify(likedSongs));
  }, [likedSongs]);

  // Song logic and main event handlers...
  useEffect(() => {
        const audio = audioRef.current;
        const currentSong = songs[currentSongIndex];
        const updateProgress = () => setProgress((audio.currentTime / audio.duration) * 100 || 0);
        const handleSongEnd = () => handleNextSong();

        if (currentSong) {
            if (audio.src !== `${API_BASE_URL}${currentSong.audio}`) {
                audio.src = `${API_BASE_URL}${currentSong.audio}`;
            }
            if (isPlaying) {
                audio.play().catch(console.error);
            } else {
                audio.pause();
            }
        }
        audio.volume = isMuted ? 0 : volume;
        audio.addEventListener('timeupdate', updateProgress);
        audio.addEventListener('ended', handleSongEnd);
        return () => {
            audio.removeEventListener('timeupdate', updateProgress);
            audio.removeEventListener('ended', handleSongEnd);
        };
    }, [isPlaying, currentSongIndex, songs, volume, isMuted]);

    const handleSongClick = (index) => {
        if (currentSongIndex === index) setIsPlaying(!isPlaying);
        else { setCurrentSongIndex(index); setIsPlaying(true); }
    };
    const handlePlayPause = () => { if (songs.length > 0) setIsPlaying(!isPlaying); };
    const handleNextSong = () => setCurrentSongIndex(p => (p + 1) % songs.length);
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const handlePrevSong = () => setCurrentSongIndex(p => (p - 1 + songs.length) % songs.length);
    const handleRestartSong = () => { audioRef.current.currentTime = 0; };
    const handleProgressClick = (e) => {
        if (!audioRef.current.duration) return;
        const progressRect = progressRef.current.getBoundingClientRect();
        audioRef.current.currentTime = ((e.clientX - progressRect.left) / progressRect.width) * audioRef.current.duration;
    };
    const handleVolumeClick = (e) => {
        const volumeRect = e.currentTarget.getBoundingClientRect();
        const newVolume = (e.clientX - volumeRect.left) / volumeRect.width;
        setVolume(newVolume);
        setIsMuted(newVolume <= 0);
    };
    const toggleMute = () => setIsMuted(!isMuted);
    const formatTime = (time) => {
        if (isNaN(time)) return "0:00";
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

  const toggleLike = (songId) => {
    setLikedSongs(prev => 
      prev.includes(songId) 
        ? prev.filter(id => id !== songId) 
        : [...prev, songId]
    );
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredSongs = songs.filter(song => 
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    song.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentSong = songs[currentSongIndex];

  if (!currentSong) {
    return <div className="bg-black text-white h-screen flex items-center justify-center">Loading Music...</div>;
  }

  return (
    <div className="h-screen w-screen bg-black text-white flex flex-col overflow-hidden">
      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden md:flex flex-col w-64 bg-black p-4 space-y-4">
          <a href="/" onClick={(e) => { e.preventDefault(); window.location.reload(); }} className="flex items-center mb-4">
            <i className="fab fa-spotify text-3xl text-green-500"></i>
            <span className="ml-2 text-xl font-bold">Spotify</span>
          </a>
          <nav>
            <a 
              href="#" 
              className={`flex items-center ${activeSection === 'home' ? 'text-white font-bold' : 'text-gray-400 hover:text-white'} p-2 rounded hover:bg-gray-800`}
              onClick={() => setActiveSection('home')}
            >
              <i className="fas fa-home text-xl w-8"></i>
              <span>Home</span>
            </a>
            <a 
              href="#" onClick={() => setIsSearchVisible(!isSearchVisible)}
              className="flex items-center text-gray-400 hover:text-white p-2 rounded hover:bg-gray-800"
            >
              <i className="fas fa-search text-xl w-8"></i>
              <span>Search</span>
            </a>
            <a 
              href="#" 
              className={`flex items-center ${activeSection === 'library' ? 'text-white font-bold' : 'text-gray-400 hover:text-white'} p-2 rounded hover:bg-gray-800`}
              onClick={() => setActiveSection('library')}
            >
              <i className="fas fa-book text-xl w-8"></i>
              <span>Your Library</span>
            </a>
          </nav>
          <div className="border-t border-gray-800 my-4"></div>
          <div className="flex-grow overflow-y-auto">
            {/* Liked Songs in sidebar */}
            <div 
              className={`${activeSection === 'liked' ? 'text-white bg-gray-800' : 'text-gray-400 hover:text-white'} cursor-pointer truncate p-2 rounded hover:bg-gray-800`}
              onClick={() => setActiveSection('liked')}
            >
              Liked Songs ({likedSongs.length})
            </div>
            
            {playlists.map(p => (
              <div 
                key={p.id} 
                className="text-gray-400 hover:text-white cursor-pointer truncate p-2 rounded hover:bg-gray-800"
              >
                {p.name}
              </div>
            ))}
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto pb-24">
          <header className="sticky top-0 z-10 p-4 flex justify-between items-center bg-gray-900 bg-opacity-50 backdrop-blur-md">
            {isSearchVisible && (
            <div className="relative w-1/3 hidden md:block">
              <input
                type="text"
                placeholder="Search songs..."
                className="w-full bg-gray-700 text-white rounded-full px-4 py-1 pl-10 focus:outline-none focus:ring-2 focus:ring-green-500"
                value={searchQuery}
                onChange={handleSearch}
              />
              <i className="fas fa-search absolute left-3 top-2 text-gray-400"></i>
            </div>
            )}
            <button className="bg-white text-black rounded-full px-6 py-1 font-bold hover:scale-105 transition-transform">Upgrade</button>
          </header>
          
          {/* Search Bar for Mobile */}
          <div className="md:hidden p-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search songs..."
                className="w-full bg-gray-700 text-white rounded-full px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-green-500"
                value={searchQuery}
                onChange={handleSearch}
              />
              <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
            </div>
          </div>

          {/* Content Grid */}
          {activeSection === 'home' && (
            <div className="p-6">
              <h1 className="text-3xl font-bold mb-6">Made For You</h1>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {filteredSongs.map((song, index) => (
                  <div key={song.id} className="bg-gray-800 bg-opacity-40 p-4 rounded-md hover:bg-gray-700 cursor-pointer group relative">
                    <div 
                      className="absolute top-2 right-2 text-gray-400 hover:text-red-500 z-10"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(song.id);
                      }}
                    >
                      <i className={`fas fa-heart ${likedSongs.includes(song.id) ? 'text-red-500' : ''}`}></i>
                    </div>
                    <div className="relative mb-4">
                      <img 
                        src={song.cover} 
                        alt={song.title} 
                        className="w-full h-auto object-cover rounded shadow-lg aspect-square" 
                        onClick={() => handleSongClick(index)}
                      />
                      <div className="absolute bottom-2 right-2 bg-green-500 rounded-full w-12 h-12 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110">
                        <i className={`fas ${isPlaying && currentSong?.id === song.id ? 'fa-pause' : 'fa-play'} text-black text-xl`}></i>
                      </div>
                    </div>
                    <h3 className="font-bold truncate">{song.title}</h3>
                    <p className="text-gray-400 text-sm">{song.artist}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          

          {/* Library Section */}
          {activeSection === 'library' && (
            <div className="p-6">
              <h1 className="text-3xl font-bold mb-6">Liked Songs</h1>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {songs
                  .filter(song => likedSongs.includes(song.id))
                  .map((song, index) => (
                    <div key={song.id} className="bg-gray-800 bg-opacity-40 p-4 rounded-md hover:bg-gray-700 cursor-pointer group relative">
                      <div 
                        className="absolute top-2 right-2 text-red-500 z-10"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(song.id);
                        }}
                      >
                        <i className="fas fa-heart"></i>
                      </div>
                      <div className="relative mb-4">
                        <img 
                          src={song.cover} 
                          alt={song.title} 
                          className="w-full h-auto object-cover rounded shadow-lg aspect-square" 
                          onClick={() => handleSongClick(songs.findIndex(s => s.id === song.id))}
                        />
                        <div className="absolute bottom-2 right-2 bg-green-500 rounded-full w-12 h-12 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110">
                          <i className={`fas ${isPlaying && currentSong?.id === song.id ? 'fa-pause' : 'fa-play'} text-black text-xl`}></i>
                        </div>
                      </div>
                      <h3 className="font-bold truncate">{song.title}</h3>
                      <p className="text-gray-400 text-sm">{song.artist}</p>
                    </div>
                  ))
                }
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Desktop Playerbar */}
      <footer className="hidden md:flex fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 p-2 items-center justify-between text-white">
        <div className="flex items-center w-1/4">
          <img src={currentSong.cover} alt={currentSong.title} className="w-14 h-14 rounded mr-3" />
          <div>
            <h4 className="font-medium text-sm">{currentSong.title}</h4>
            <p className="text-gray-400 text-xs">{currentSong.artist}</p>
          </div>
          <div 
            className="ml-4 text-gray-400 hover:text-red-500 cursor-pointer"
            onClick={() => toggleLike(currentSong.id)}
          >
            <i className={`fas fa-heart ${likedSongs.includes(currentSong.id) ? 'text-red-500' : ''}`}></i>
          </div>
        </div>
        <div className="flex flex-col items-center w-2/4">
          <div className="flex items-center mb-2">
            <button onClick={handlePrevSong} className="mx-4 text-gray-400 hover:text-white">
              <i className="fas fa-step-backward"></i>
            </button>
            <button onClick={handlePlayPause} className="bg-white rounded-full w-8 h-8 flex items-center justify-center hover:scale-105">
              <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'} text-black`}></i>
            </button>
            <button onClick={handleNextSong} className="mx-4 text-gray-400 hover:text-white">
              <i className="fas fa-step-forward"></i>
            </button>
          </div>
          <div className="w-full flex items-center">
            <span className="text-xs text-gray-400 mr-2">{formatTime(audioRef.current.currentTime)}</span>
            <div ref={progressRef} onClick={handleProgressClick} className="progress-container flex-grow">
              <div className="progress" style={{ width: `${progress}%` }}></div>
            </div>
            <span className="text-xs text-gray-400 ml-2">{formatTime(audioRef.current.duration)}</span>
          </div>
        </div>
        <div className="flex items-center justify-end w-1/4">
          <button onClick={toggleMute} className="mx-2 text-gray-400 hover:text-white">
            <i className={`fas ${isMuted || volume === 0 ? 'fa-volume-mute' : 'fa-volume-up'}`}></i>
          </button>
          <div onClick={handleVolumeClick} className="w-24 progress-container">
            <div className="progress" style={{ width: `${isMuted ? 0 : volume * 100}%` }}></div>
          </div>
        </div>
      </footer>

      {/* Mobile Footer */}
      <footer className="md:hidden fixed bottom-0 w-full z-20">
        <div className="bg-gray-800 p-2 flex items-center" onClick={handlePlayPause}>
          <img src={currentSong.cover} alt={currentSong.title} className="w-12 h-12 rounded mr-3" />
          <div className="flex-1">
            <h4 className="font-medium text-sm">{currentSong.title}</h4>
            <p className="text-gray-400 text-xs">{currentSong.artist}</p>
          </div>
          <button className="text-2xl p-2">
            <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
          </button>
          <div 
            className="ml-2 text-red-500 p-2"
            onClick={(e) => {
              e.stopPropagation();
              toggleLike(currentSong.id);
            }}
          >
            <i className={`fas fa-heart ${likedSongs.includes(currentSong.id) ? 'text-red-500' : ''}`}></i>
          </div>
        </div>
        <nav className="flex justify-around items-center bg-black border-t border-gray-800 py-2">
          <a 
            href="#" 
            className={`flex flex-col items-center ${activeSection === 'home' ? 'text-white' : 'text-gray-400'} w-1/3`}
            onClick={() => setActiveSection('home')}
          >
            <i className="fas fa-home"></i>
            <span className="text-xs mt-1">Home</span>
          </a>
          <a 
            href="#" 
            className="flex flex-col items-center text-gray-400 w-1/3"
          >
            <i className="fas fa-search"></i>
            <span className="text-xs mt-1">Search</span>
          </a>
          <a 
            href="#" 
            className={`flex flex-col items-center ${activeSection === 'library' ? 'text-white' : 'text-gray-400'} w-1/3`}
            onClick={() => setActiveSection('library')}
          >
            <i className="fas fa-book"></i>
            <span className="text-xs mt-1">Library</span>
          </a>
        </nav>
      </footer>
    </div>
  );
}

export default App;