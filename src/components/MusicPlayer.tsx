import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Music } from 'lucide-react';

const tracks = [
  { id: 1, title: "Neon Drive", artist: "AI Synthwave", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { id: 2, title: "Cyber City", artist: "NeuralNet", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { id: 3, title: "Digital Horizon", artist: "AlgoBeats", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" }
];

export default function MusicPlayer() {
  const [currentTrackIdx, setCurrentTrackIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(e => console.error("Playback failed", e));
      }
    }
  };

  const nextTrack = () => {
    setCurrentTrackIdx((prev) => (prev + 1) % tracks.length);
  };

  const prevTrack = () => {
    setCurrentTrackIdx((prev) => (prev - 1 + tracks.length) % tracks.length);
  };

  useEffect(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.play().catch(e => console.error("Audio play failed:", e));
    }
  }, [currentTrackIdx]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current && duration > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const newTime = (clickX / rect.width) * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-6 w-full relative overflow-hidden">
      <div className="flex items-center gap-4 z-10">
        <div className="w-16 h-16 shrink-0 bg-indigo-50 rounded-lg flex items-center justify-center relative overflow-hidden">
          <Music className="text-indigo-600 w-8 h-8 relative z-10" />
        </div>
        <div className="flex flex-col overflow-hidden">
          <span className="text-[10px] text-gray-500 font-semibold tracking-wider uppercase mb-1">Now Playing</span>
          <h3 className="text-gray-900 font-bold truncate text-lg leading-tight">{tracks[currentTrackIdx].title}</h3>
          <p className="text-gray-500 text-sm truncate">{tracks[currentTrackIdx].artist}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2 z-10">
        <div 
          className="h-2 w-full bg-gray-100 rounded-full overflow-hidden cursor-pointer relative"
          onClick={handleProgressClick}
        >
          <div className="absolute top-0 left-0 h-full bg-indigo-600 pointer-events-none transition-all duration-100" style={{ width: `${progress}%` }}>
          </div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 font-medium">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-6 z-10">
        <button onClick={prevTrack} className="text-gray-400 hover:text-indigo-600 transition-colors cursor-pointer">
          <SkipBack className="w-6 h-6" />
        </button>
        <button onClick={togglePlay} className="w-14 h-14 shrink-0 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 flex items-center justify-center shadow-sm transition-all cursor-pointer">
          {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
        </button>
        <button onClick={nextTrack} className="text-gray-400 hover:text-indigo-600 transition-colors cursor-pointer">
          <SkipForward className="w-6 h-6" />
        </button>
      </div>

      <audio
        ref={audioRef}
        src={tracks[currentTrackIdx].url}
        onEnded={nextTrack}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
      />
    </div>
  );
}
