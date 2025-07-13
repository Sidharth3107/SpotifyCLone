import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const API_BASE_URL = 'http://localhost:3001';

// --- Reusable Components for Cleanliness ---
const SidebarNav = () => (
    <nav className="flex flex-col space-y-4">
        <a href="#" className="flex items-center text-white font-bold"><i className="fas fa-home text-xl w-8"></i><span className="hidden md:inline">Home</span></a>
        <a href="#" className="flex items-center text-gray-400 hover:text-white"><i className="fas fa-search text-xl w-8"></i><span className="hidden md:inline">Search</span></a>
        <a href="#" className="flex items-center text-gray-400 hover:text-white"><i className="fas fa-book text-xl w-8"></i><span className="hidden md:inline">Your Library</span></a>
    </nav>
);

const PlaylistNav = ({ playlists }) => (
    <div className="mt-8 flex-grow overflow-y-auto">
        {playlists.map(p => <div key={p.id} className="text-gray-400 hover:text-white cursor-pointer truncate py-1">{p.name}</div>)}
    </div>
);

// --- Main App Component ---
function App() {
    // --- State and Refs ---
    const [playlists, setPlaylists] = useState([]);
    const [songs, setSongs] = useState([]);
    const [currentSongIndex, setCurrentSongIndex] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(new Audio());

    // --- Data Fetching ---
    useEffect(() => {
        fetch(`${API_BASE_URL}/api/songs`).then(res => res.json()).then(data => {
            setSongs(data);
            if(data.length > 0) setCurrentSongIndex(0);
        });
        fetch(`${API_BASE_URL}/api/playlists`).then(res => res.json()).then(data => setPlaylists(data));
    }, []);

    // --- Audio Playback Logic ---
    useEffect(() => {
        const audio = audioRef.current;
        const currentSong = songs[currentSongIndex];
        if (currentSong) {
            if (audio.src !== `${API_BASE_URL}${currentSong.audio}`) {
                audio.src = `${API_BASE_URL}${currentSong.audio}`;
            }
            isPlaying ? audio.play().catch(console.error) : audio.pause();
        }
    }, [isPlaying, currentSongIndex, songs]);

    // --- Event Handlers ---
    const handleSongClick = (index) => {
        if (currentSongIndex === index) setIsPlaying(!isPlaying);
        else {
            setCurrentSongIndex(index);
            setIsPlaying(true);
        }
    };
    const togglePlayPause = () => setIsPlaying(!isPlaying);
    
    const currentSong = songs[currentSongIndex];

    if (!currentSong) {
        return <div className="bg-black text-white h-screen flex items-center justify-center">Loading...</div>;
    }

    // --- JSX RENDER ---
    return (
        <div className="h-screen w-screen bg-black text-white flex flex-col">
            {/* Main view with sidebar for desktop */}
            <div className="flex flex-1 overflow-hidden">
                {/* Desktop Sidebar */}
                <aside className="hidden md:flex flex-col w-64 bg-black border-r border-gray-800 p-4">
                    <div className="flex items-center mb-8">
                        <i className="fab fa-spotify text-3xl text-green-500"></i>
                        <span className="ml-2 text-xl font-bold">Spotify</span>
                    </div>
                    <SidebarNav />
                    <PlaylistNav playlists={playlists} />
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto pb-24 md:pb-24">
                    <header className="sticky top-0 z-10 p-4 flex justify-end items-center bg-gray-900 bg-opacity-50 backdrop-blur-md">
                        <button className="bg-white text-black rounded-full px-6 py-1 font-bold hover:scale-105 transition-transform">Upgrade</button>
                    </header>
                    <div className="p-6">
                        <h1 className="text-3xl font-bold mb-6">Made For You</h1>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                            {songs.map((song, index) => (
                                <div key={song.id} onClick={() => handleSongClick(index)} className="bg-gray-800 bg-opacity-40 p-4 rounded-md hover:bg-gray-700 cursor-pointer transition-colors group">
                                    <div className="relative mb-4">
                                        <img src={song.cover} alt={song.title} className="w-full h-auto object-cover rounded shadow-lg" />
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
                </main>
            </div>

            {/* Mobile Bottom Navigation - Hidden on Medium screens and up */}
            <nav className="md:hidden flex justify-around items-center bg-gradient-to-t from-black to-gray-900 border-t border-gray-800 p-2 fixed bottom-0 w-full">
                <a href="#" className="flex flex-col items-center text-white w-1/3"><i className="fas fa-home"></i><span className="text-xs mt-1">Home</span></a>
                <a href="#" className="flex flex-col items-center text-gray-400 w-1/3"><i className="fas fa-search"></i><span className="text-xs mt-1">Search</span></a>
                <a href="#" className="flex flex-col items-center text-gray-400 w-1/3"><i className="fas fa-book"></i><span className="text-xs mt-1">Library</span></a>
            </nav>
            
            {/* Universal Player Bar - a bit different for mobile vs desktop */}
            <footer className="fixed bottom-0 left-0 right-0 z-20">
                 {/* This container has a different bottom padding on mobile to not overlap the mobile nav */}
                <div className="bg-gray-900 border-t border-gray-700 p-2 md:p-4 pb-20 md:pb-4">
                    {/* Desktop Player */}
                    <div className="hidden md:flex items-center justify-between">
                         <div className="flex items-center w-1/3">
                             <img src={currentSong.cover} alt={currentSong.title} className="w-14 h-14 rounded mr-3" />
                             <div><h4 className="font-medium text-sm">{currentSong.title}</h4><p className="text-gray-400 text-xs">{currentSong.artist}</p></div>
                         </div>
                         <div className="flex items-center">
                             <button onClick={togglePlayPause} className="bg-white rounded-full w-8 h-8 flex items-center justify-center hover:scale-105"><i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'} text-black`}></i></button>
                         </div>
                         <div className="w-1/3"></div>
                    </div>
                    {/* Mobile Player */}
                    <div className="md:hidden flex items-center" onClick={togglePlayPause}>
                        <img src={currentSong.cover} alt={currentSong.title} className="w-12 h-12 rounded mr-3" />
                        <div className="flex-1"><h4 className="font-medium text-sm">{currentSong.title}</h4><p className="text-gray-400 text-xs">{currentSong.artist}</p></div>
                        <button className="text-2xl p-2"><i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i></button>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default App;