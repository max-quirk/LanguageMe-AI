import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import TrackPlayer from 'react-native-track-player';
import { WordSegment } from 'services/whisper';

type AudioContextType = {
  playing: boolean;
  playPauseAudio: (audioFile: string) => void;
  pauseAudio: () => void;
  resumeAudio: () => void;
  currentFile: string | null;
  setCurrentFile: React.Dispatch<React.SetStateAction<string | null>>
  currentFileWordTimestamps: WordSegment[] | null
  setCurrentFileWordTimestamps: React.Dispatch<React.SetStateAction<WordSegment[] | null>>
};

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [playing, setPlaying] = useState<boolean>(false);
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [currentFileWordTimestamps, setCurrentFileWordTimestamps] = useState<WordSegment[] | null>(null);

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
          url: audioFile,
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

  const resumeAudio = async () => {
    if (!playing) {
      await TrackPlayer.play();
      setPlaying(true);
    }
  }

  useEffect(() => {
    return () => {
      TrackPlayer.stop();
      setPlaying(false);
      setCurrentFile(null);
    };
  }, []);
  
  return (
    <AudioContext.Provider 
      value={{ 
        playing, 
        playPauseAudio, 
        pauseAudio, 
        resumeAudio, 
        currentFile, 
        setCurrentFile,
        currentFileWordTimestamps,
        setCurrentFileWordTimestamps,
      }}>
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
