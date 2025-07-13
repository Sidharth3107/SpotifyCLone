import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const API_BASE_URL = 'https://spotify-clone-9qkq.vercel.app/';

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
    const togglePlayPause = () => {
        if (songs.length > 0) setIsPlaying(!isPlaying);
    };
    
    const currentSong = songs[currentSongIndex];

    if (!currentSong) {
        return <div className="bg-black text-white h-screen flex items-center justify-center">Loading Music...</div>;
    }

    // --- JSX RENDER ---
    return (
        <div className="h-screen w-screen bg-black text-white flex flex-col md:flex-row overflow-hidden">
            
            {/* --- Desktop Sidebar (Hidden on Mobile) --- */}
            <aside className="hidden md:flex flex-col w-64 bg-black p-4">
                <div className="flex items-center mb-8">
                    <i className="fab fa-spotify text-3xl text-green-500"></i>
                    <span className="ml-2 text-xl font-bold">Spotify</span>
                </div>
                <nav className="flex flex-col space-y-4">
                    <a href="#" className="flex items-center text-white font-bold"><i className="fas fa-home text-xl w-8"></i><span>Home</span></a>
                    <a href="#" className="flex items-center text-gray-400 hover:text-white"><i className="fas fa-search text-xl w-8"></i><span>Search</span></a>
                    <a href="#" className="flex items-center text-gray-400 hover:text-white"><i className="fas fa-book text-xl w-8"></i><span>Your Library</span></a>
                </nav>
                <div className="border-t border-gray-800 my-4"></div>
                <div className="overflow-y-auto">
                    {playlists.map(p => <div key={p.id} className="text-gray-400 hover:text-white cursor-pointer truncate py-1">{p.name}</div>)}
                </div>
            </aside>

            {/* --- Main Content --- */}
            <main className="flex-1 overflow-y-auto pb-24">
                <div className="p-6">
                    <h1 className="text-3xl font-bold mb-6">Made For You</h1>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {songs.map((song, index) => (
                            <div key={song.id} onClick={() => handleSongClick(index)} className="bg-gray-800 bg-opacity-40 p-4 rounded-md hover:bg-gray-700 cursor-pointer group">
                                <div className="relative mb-4">
                                    <img src={song.cover} alt={song.title} className="w-full h-auto object-cover rounded shadow-lg aspect-square" />
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

            {/* --- Player Area (Universal) --- */}
            <div className="w-full fixed bottom-0 left-0">
                {/* Desktop Player (Hidden on Mobile) */}
                <footer className="hidden md:flex bg-gray-900 border-t border-gray-700 p-4 items-center justify-between">
                     <div className="flex items-center w-1/3">
                         <img src={currentSong.cover} alt={currentSong.title} className="w-14 h-14 rounded mr-3" />
                         <div><h4 className="font-medium text-sm">{currentSong.title}</h4><p className="text-gray-400 text-xs">{currentSong.artist}</p></div>
                     </div>
                     <div className="flex items-center">
                         <button onClick={togglePlayPause} className="bg-white rounded-full w-8 h-8 flex items-center justify-center hover:scale-105"><i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'} text-black`}></i></button>
                     </div>
                     <div className="w-1/3"></div>
                </footer>

                {/* Mobile Player & Navigation (Hidden on Desktop) */}
                <footer className="md:hidden bg-black">
                    <div className="bg-gray-800 p-2 flex items-center" onClick={togglePlayPause}>
                        <img src={currentSong.cover} alt={currentSong.title} className="w-12 h-12 rounded mr-3" />
                        <div className="flex-1"><h4 className="font-medium text-sm">{currentSong.title}</h4><p className="text-gray-400 text-xs">{currentSong.artist}</p></div>
                        <button className="text-2xl p-2"><i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i></button>
                    </div>
                    <nav className="flex justify-around items-center bg-black py-2">
                        <a href="#" className="flex flex-col items-center text-white w-1/3"><i className="fas fa-home"></i><span className="text-xs mt-1">Home</span></a>
                        <a href="#" className="flex flex-col items-center text-gray-400 w-1/3"><i className="fas fa-search"></i><span className="text-xs mt-1">Search</span></a>
                        <a href="#" className="flex flex-col items-center text-gray-400 w-1/3"><i className="fas fa-book"></i><span className="text-xs mt-1">Library</span></a>
                    </nav>
                </footer>
            </div>
        </div>
    );
}

export default App;