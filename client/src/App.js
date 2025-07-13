import React, { useState, useEffect, useRef } from 'react';
import './App.css';

// It's better to use your Vercel environment variable for production
const API_BASE_URL = 'https://spotifyclone-o4ob.onrender.com'

function App() {
    // --- STATE & REFS (No changes needed here) ---
    const [playlists, setPlaylists] = useState([]);
    const [songs, setSongs] = useState([]);
    const [currentSongIndex, setCurrentSongIndex] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [volume, setVolume] = useState(0.8);
    const [isMuted, setIsMuted] = useState(false);
    const audioRef = useRef(new Audio());
    const progressRef = useRef(null);

    // --- DATA FETCHING (No changes needed here) ---
    useEffect(() => {
        fetch(`${API_BASE_URL}/api/songs`).then(res => res.json()).then(data => {
            setSongs(data);
            if(data.length > 0) setCurrentSongIndex(0);
        }).catch(err => console.error("Error fetching songs:", err));

        fetch(`${API_BASE_URL}/api/playlists`).then(res => res.json()).then(data => setPlaylists(data)).catch(err => console.error("Error fetching playlists:", err));
    }, []);
    
    // --- AUDIO LOGIC & EVENT HANDLERS (No changes needed here) ---
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
    
    const currentSong = songs[currentSongIndex];

    if (!currentSong) {
        return <div className="bg-black text-white h-screen flex items-center justify-center">Loading Music...</div>;
    }

    // --- JSX RENDER (This section is now correctly structured for responsiveness) ---
    return (
        <div className="h-screen w-screen bg-black text-white flex flex-col overflow-hidden">
            {/* Main container for Sidebar and Content */}
            <div className="flex flex-1 overflow-hidden">
                {/* --- DESKTOP SIDEBAR --- Hidden on screens smaller than md (medium) */}
                <aside className="hidden md:flex flex-col w-64 bg-black p-4 space-y-4">
                    <a href="/" onClick={(e) => { e.preventDefault(); window.location.reload(); }} className="flex items-center mb-4">
                        <i className="fab fa-spotify text-3xl text-green-500"></i><span className="ml-2 text-xl font-bold">Spotify</span>
                    </a>
                    <nav>
                        <a href="#" className="flex items-center text-white font-bold p-2 rounded hover:bg-gray-800"><i className="fas fa-home text-xl w-8"></i><span>Home</span></a>
                        <a href="#" className="flex items-center text-gray-400 hover:text-white p-2 rounded hover:bg-gray-800"><i className="fas fa-search text-xl w-8"></i><span>Search</span></a>
                        <a href="#" className="flex items-center text-gray-400 hover:text-white p-2 rounded hover:bg-gray-800"><i className="fas fa-book text-xl w-8"></i><span>Your Library</span></a>
                    </nav>
                    <div className="border-t border-gray-800 my-4"></div>
                    <div className="flex-grow overflow-y-auto">
                        {playlists.map(p => <div key={p.id} className="text-gray-400 hover:text-white cursor-pointer truncate p-2 rounded hover:bg-gray-800">{p.name}</div>)}
                    </div>
                </aside>

                {/* --- Main Content --- */}
                <main className="flex-1 overflow-y-auto pb-24">
                    {/* Header */}
                    <header className="sticky top-0 z-10 p-4 flex justify-end items-center bg-gray-900 bg-opacity-50 backdrop-blur-md">
                        <button className="bg-white text-black rounded-full px-6 py-1 font-bold hover:scale-105 transition-transform">Upgrade</button>
                    </header>
                    {/* Content Grid */}
                    <div className="p-6">
                        <h1 className="text-3xl font-bold mb-6">Made For You</h1>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                            {songs.map((song, index) => (
                                <div key={song.id} onClick={() => handleSongClick(index)} className="bg-gray-800 bg-opacity-40 p-4 rounded-md hover:bg-gray-700 cursor-pointer group">
                                    <div className="relative mb-4"><img src={song.cover} alt={song.title} className="w-full h-auto object-cover rounded shadow-lg aspect-square" /><div className="absolute bottom-2 right-2 bg-green-500 rounded-full w-12 h-12 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"><i className={`fas ${isPlaying && currentSong?.id === song.id ? 'fa-pause' : 'fa-play'} text-black text-xl`}></i></div></div>
                                    <h3 className="font-bold truncate">{song.title}</h3><p className="text-gray-400 text-sm">{song.artist}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>

            {/* --- DESKTOP PLAYER --- Hidden on mobile */}
            <footer className="hidden md:flex fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 p-2 items-center justify-between text-white">
                <div className="flex items-center w-1/4"><img src={currentSong.cover} alt={currentSong.title} className="w-14 h-14 rounded mr-3" /><div><h4 className="font-medium text-sm">{currentSong.title}</h4><p className="text-gray-400 text-xs">{currentSong.artist}</p></div></div>
                <div className="flex flex-col items-center w-2/4">
                    <div className="flex items-center mb-2"><button onClick={handlePrevSong} className="mx-4 text-gray-400 hover:text-white"><i className="fas fa-step-backward"></i></button><button onClick={handlePlayPause} className="bg-white rounded-full w-8 h-8 flex items-center justify-center hover:scale-105"><i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'} text-black`}></i></button><button onClick={handleNextSong} className="mx-4 text-gray-400 hover:text-white"><i className="fas fa-step-forward"></i></button></div>
                    <div className="w-full flex items-center"><span className="text-xs text-gray-400 mr-2">{formatTime(audioRef.current.currentTime)}</span><div ref={progressRef} onClick={handleProgressClick} className="progress-container flex-grow"><div className="progress" style={{ width: `${progress}%` }}></div></div><span className="text-xs text-gray-400 ml-2">{formatTime(audioRef.current.duration)}</span></div>
                </div>
                <div className="flex items-center justify-end w-1/4"><button onClick={toggleMute} className="mx-2 text-gray-400 hover:text-white"><i className={`fas ${isMuted || volume === 0 ? 'fa-volume-mute' : 'fa-volume-up'}`}></i></button><div onClick={handleVolumeClick} className="w-24 progress-container"><div className="progress" style={{ width: `${isMuted ? 0 : volume * 100}%` }}></div></div></div>
            </footer>
            
            {/* --- MOBILE FOOTER (Player + Nav) --- Hidden on desktop */}
            <footer className="md:hidden fixed bottom-0 w-full z-20">
                <div className="bg-gray-800 p-2 flex items-center" onClick={togglePlayPause}>
                    <img src={currentSong.cover} alt={currentSong.title} className="w-12 h-12 rounded mr-3" />
                    <div className="flex-1"><h4 className="font-medium text-sm">{currentSong.title}</h4><p className="text-gray-400 text-xs">{currentSong.artist}</p></div>
                    <button className="text-2xl p-2"><i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i></button>
                </div>
                <nav className="flex justify-around items-center bg-black border-t border-gray-800 py-2">
                    <a href="#" className="flex flex-col items-center text-white w-1/3"><i className="fas fa-home"></i><span className="text-xs mt-1">Home</span></a>
                    <a href="#" className="flex flex-col items-center text-gray-400 w-1/3"><i className="fas fa-search"></i><span className="text-xs mt-1">Search</span></a>
                    <a href="#" className="flex flex-col items-center text-gray-400 w-1/3"><i className="fas fa-book"></i><span className="text-xs mt-1">Library</span></a>
                </nav>
            </footer>
        </div>
    );
}

export default App;