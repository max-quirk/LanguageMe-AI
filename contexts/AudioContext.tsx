import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import TrackPlayer from 'react-native-track-player';

type AudioContextType = {
  playing: boolean;
  playPauseAudio: (audioFile: string) => void;
  pauseAudio: () => void;
};

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [playing, setPlaying] = useState<boolean>(false);
  const [currentFile, setCurrentFile] = useState<string | null>(null);

  const playPauseAudio = async (audioFile: string) => {
    if (playing) {
      await TrackPlayer.pause();
      setPlaying(false);
    } else {
      if (currentFile === audioFile) {
        await TrackPlayer.play();
      } else {
        await TrackPlayer.reset();
        await TrackPlayer.add({
          id: 'trackId',
          url: audioFile,
          title: 'Audio',
          artist: 'Artist',
        });
        await TrackPlayer.play();
        setCurrentFile(audioFile);
      }
      setPlaying(true);
    }
  };

  const pauseAudio = async () => {
    if (playing) {
      await TrackPlayer.pause();
      setPlaying(false);
    }
  };

  useEffect(() => {
    return () => {
      TrackPlayer.stop();
      setPlaying(false);
      setCurrentFile(null);
    };
  }, []);

  return (
    <AudioContext.Provider value={{ playing, playPauseAudio, pauseAudio }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
