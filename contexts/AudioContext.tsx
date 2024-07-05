import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import TrackPlayer, { State, usePlaybackState } from 'react-native-track-player';
import { ReadingWithWordTimeStamps } from 'services/whisper';

type AudioContextType = {
  playing: boolean;
  playPauseAudio: (audioFile: string) => void;
  pauseAudio: () => void;
  resumeAudio: () => void;
  currentFile: string | null;
  setCurrentFile: React.Dispatch<React.SetStateAction<string | null>>
  currentFileWordTimestamps: ReadingWithWordTimeStamps | null
  setCurrentFileWordTimestamps: React.Dispatch<React.SetStateAction<ReadingWithWordTimeStamps | null>>
  trackEnded: boolean
  setTrackEnded: React.Dispatch<React.SetStateAction<boolean>>
};

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [currentFileWordTimestamps, setCurrentFileWordTimestamps] = useState<ReadingWithWordTimeStamps | null>(null);
  const [trackEnded, setTrackEnded] = useState<boolean>(false);

  const playbackState = usePlaybackState();

  const playing = playbackState.state === State.Playing

  const playPauseAudio = async (audioFile: string) => {
    if (playing) {
      await TrackPlayer.pause();
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
    }
  };

  const pauseAudio = async () => {
    if (playing) {
      await TrackPlayer.pause();
    }
  };

  const resumeAudio = async () => {
    if (!playing) {
      await TrackPlayer.play();
    }
  }

  useEffect(() => {
    return () => {
      TrackPlayer.stop();
      TrackPlayer.reset();
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
        trackEnded,
        setTrackEnded
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
