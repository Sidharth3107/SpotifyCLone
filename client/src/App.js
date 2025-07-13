import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const API_BASE_URL = 'https://spotifyclone-d7fz.onrender.com';

function App() {
    // --- STATE MANAGEMENT ---
    const [playlists, setPlaylists] = useState([]);
    const [songs, setSongs] = useState([]);
    const [currentSongIndex, setCurrentSongIndex] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [volume, setVolume] = useState(0.8);
    const [isMuted, setIsMuted] = useState(false);

    const audioRef = useRef(new Audio());
    const progressRef = useRef(null);

    // --- DATA FETCHING ---
    useEffect(() => {
        fetch(`${API_BASE_URL}/api/songs`).then(res => res.json()).then(data => {
            setSongs(data);
            if(data.length > 0) {
                setCurrentSongIndex(0);
            }
        });
        fetch(`${API_BASE_URL}/api/playlists`).then(res => res.json()).then(data => setPlaylists(data));
    }, []);

    // --- AUDIO PLAYBACK & PROGRESS LOGIC ---
    useEffect(() => {
        const audio = audioRef.current;
        const currentSong = songs[currentSongIndex];

        const updateProgress = () => setProgress((audio.currentTime / audio.duration) * 100);
        const handleSongEnd = () => handleNextSong();

        if (currentSong) {
            if (audio.src !== `${API_BASE_URL}${currentSong.audio}`) {
                audio.src = `${API_BASE_URL}${currentSong.audio}`;
            }
            if (isPlaying) {
                audio.play().catch(e => console.error("Audio Play Error:", e));
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

    // --- PLAYER CONTROL HANDLERS ---
    const handlePlayPause = () => {
        if (songs.length === 0) return;
        setIsPlaying(!isPlaying);
    };

    const handleSongClick = (index) => {
        if (currentSongIndex === index) {
            handlePlayPause();
        } else {
            setCurrentSongIndex(index);
            setIsPlaying(true);
        }
    };

    const handleNextSong = () => setCurrentSongIndex((prevIndex) => (prevIndex + 1) % songs.length);
    const handlePrevSong = () => setCurrentSongIndex((prevIndex) => (prevIndex - 1 + songs.length) % songs.length);
    const handleRestartSong = () => audioRef.current.currentTime = 0;

    const handleProgressClick = (e) => {
        if (!audioRef.current.duration) return;
        const progressRect = progressRef.current.getBoundingClientRect();
        const clickPosition = e.clientX - progressRect.left;
        const newProgress = (clickPosition / progressRect.width);
        audioRef.current.currentTime = newProgress * audioRef.current.duration;
    };

    const handleVolumeClick = (e) => {
        const volumeRect = e.currentTarget.getBoundingClientRect();
        const newVolume = (e.clientX - volumeRect.left) / volumeRect.width;
        setVolume(newVolume);
        setIsMuted(false);
    };

    const toggleMute = () => setIsMuted(!isMuted);

    const formatTime = (time) => {
        if (isNaN(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const currentSong = songs[currentSongIndex];

    if (!currentSong) {
        return <div className="bg-black text-white h-screen flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="flex flex-col md:flex-row h-screen overflow-hidden">
            {/* --- Sidebar --- */}
            <div className="sidebar bg-black w-full md:w-64 flex-shrink-0 flex flex-col border-r border-gray-800">
                <a href="/" className="p-6 block" onClick={(e) => { e.preventDefault(); window.location.reload(); }}>
                    <div className="flex items-center"><i className="fab fa-spotify text-3xl text-green-500"></i><span className="ml-2 text-xl font-bold hidden md:inline">Spotify</span></div>
                </a>
                <div className="px-6 py-4">
                    <ul>
                        <li className="mb-4"><a href="#" className="flex items-center text-white hover:text-green-500"><i className="fas fa-home text-xl"></i><span className="ml-4 font-medium hidden md:inline">Home</span></a></li>
                        <li className="mb-4"><a href="#" className="flex items-center text-gray-400 hover:text-white"><i className="fas fa-search text-xl"></i><span className="ml-4 font-medium hidden md:inline">Search</span></a></li>
                        <li className="mb-4"><a href="#" className="flex items-center text-gray-400 hover:text-white"><i className="fas fa-book text-xl"></i><span className="ml-4 font-medium hidden md:inline">Your Library</span></a></li>
                    </ul>
                </div>
                <div className="px-6 py-4 mt-6">
                    <div className="flex items-center mb-6 text-gray-400 hover:text-white cursor-pointer"><i className="fas fa-plus-square text-xl"></i><span className="ml-4 font-medium hidden md:inline">Create Playlist</span></div>
                    <div className="flex items-center text-gray-400 hover:text-white cursor-pointer"><i className="fas fa-heart text-xl text-purple-500"></i><span className="ml-4 font-medium hidden md:inline">Liked Songs</span></div>
                </div>
                <div className="border-t border-gray-800 mt-4 mx-6"></div>
                <div className="px-6 py-4 flex-grow overflow-y-auto">
                    <ul>{playlists.map(p => <li key={p.id} className="text-gray-400 hover:text-white cursor-pointer truncate py-1">{p.name}</li>)}</ul>
                </div>
            </div>

            {/* --- Main Content --- */}
            <div className="main-content flex-grow overflow-y-auto bg-gradient-to-b from-gray-900 to-black pb-32">
                <header className="sticky top-0 z-10 p-4 flex justify-between items-center bg-gray-900 bg-opacity-50 backdrop-blur-md">
                    <div className="flex items-center">
                        <button className="bg-black bg-opacity-40 rounded-full p-2 mr-4"><i className="fas fa-chevron-left"></i></button>
                        <button className="bg-black bg-opacity-40 rounded-full p-2"><i className="fas fa-chevron-right"></i></button>
                    </div>
                    <div className="flex items-center">
                        <button className="bg-white text-black rounded-full px-6 py-1 font-bold hover:scale-105 transition-transform">Premium+</button>
                        <div className="ml-4 flex items-center bg-black bg-opacity-70 rounded-full p-1 cursor-pointer hover:bg-opacity-100">
                            <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center"><span className="font-bold">S</span></div>
                            <span className="mx-2 font-medium hidden md:inline">Sidharth</span>
                            <i className="fas fa-chevron-down mr-1 hidden md:inline"></i>
                        </div>
                    </div>
                </header>
                <div className="p-6">
                    <h1 className="text-3xl font-bold mb-6">Favourites</h1>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                        {songs.map((song, index) => (
                            <div key={song.id} onClick={() => handleSongClick(index)} className="bg-gray-800 bg-opacity-40 p-4 rounded-md hover:bg-gray-700 cursor-pointer transition-colors group">
                                <div className="relative mb-4">
                                    <img src={song.cover} alt={song.title} className="w-full rounded shadow-lg" />
                                    <button className="absolute bottom-2 right-2 bg-green-500 rounded-full w-12 h-12 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110">
                                        <i className={`fas ${isPlaying && currentSong?.id === song.id ? 'fa-pause' : 'fa-play'} text-black text-xl`}></i>
                                    </button>
                                </div>
                                <h3 className="font-bold truncate">{song.title}</h3>
                                <p className="text-gray-400 text-sm">{song.artist}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- Player Bar --- */}
            <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-gray-800 to-black border-t border-gray-700 p-2 md:p-4 flex items-center justify-between">
                <div className="flex items-center w-full md:w-1/4">
                    <img src={currentSong.cover} alt={currentSong.title} className={`w-14 h-14 rounded mr-3 ${isPlaying ? 'playing-animation' : ''}`} />
                    <div><h4 className="font-medium text-sm">{currentSong.title}</h4><p className="text-gray-400 text-xs">{currentSong.artist}</p></div>
                    <button className="ml-4 text-gray-400 hover:text-white"><i className="far fa-heart"></i></button>
                </div>
                <div className="flex flex-col items-center w-full md:w-2/4">
                    <div className="flex items-center mb-2">
                        <button className="mx-2 text-gray-400 hover:text-white"><i className="fas fa-random"></i></button>
                        <button onClick={handlePrevSong} className="mx-2 text-gray-400 hover:text-white"><i className="fas fa-step-backward"></i></button>
                        <button onClick={handlePlayPause} className="mx-3 bg-white rounded-full w-8 h-8 flex items-center justify-center hover:scale-105">
                            <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'} text-black`}></i>
                        </button>
                        <button onClick={handleNextSong} className="mx-2 text-gray-400 hover:text-white"><i className="fas fa-step-forward"></i></button>
                        <button onClick={handleRestartSong} className="mx-2 text-gray-400 hover:text-white"><i className="fas fa-redo"></i></button>
                    </div>
                    <div className="w-full flex items-center">
                        <span className="text-xs text-gray-400 mr-2">{formatTime(audioRef.current.currentTime)}</span>
                        <div ref={progressRef} onClick={handleProgressClick} className="progress-container flex-grow mx-2">
                            <div className="progress" style={{ width: `${progress}%` }}></div>
                        </div>
                        <span className="text-xs text-gray-400 ml-2">{formatTime(audioRef.current.duration)}</span>
                    </div>
                </div>
                <div className="flex items-center justify-end w-full md:w-1/4">
                    <button className="mx-2 text-gray-400 hover:text-white"><i className="fas fa-list"></i></button>
                    <button onClick={toggleMute} className="mx-2 text-gray-400 hover:text-white">
                        <i className={`fas ${isMuted || volume === 0 ? 'fa-volume-mute' : 'fa-volume-up'}`}></i>
                    </button>
                    <div onClick={handleVolumeClick} className="w-24 mx-2 progress-container">
                        <div className="progress" style={{ width: `${isMuted ? 0 : volume * 100}%` }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;