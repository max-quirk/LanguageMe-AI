import { useEffect } from 'react';
import { AppState, Platform } from 'react-native';
import TrackPlayer from 'react-native-track-player';

export const usePlayerSetup = () => {
  useEffect(() => {
    const setupPlayer = async () => {
      await TrackPlayer.setupPlayer();
      await TrackPlayer.updateOptions({
        stopWithApp: true,
        capabilities: [
          TrackPlayer.CAPABILITY_PLAY,
          TrackPlayer.CAPABILITY_PAUSE,
          TrackPlayer.CAPABILITY_STOP,
          TrackPlayer.CAPABILITY_SEEK_TO,
        ],
        notificationCapabilities: [
          TrackPlayer.CAPABILITY_PLAY,
          TrackPlayer.CAPABILITY_PAUSE,
          TrackPlayer.CAPABILITY_STOP,
          TrackPlayer.CAPABILITY_SEEK_TO,
        ],
        compactCapabilities: [
          TrackPlayer.CAPABILITY_PLAY,
          TrackPlayer.CAPABILITY_PAUSE,
        ],
        foregroundService: true,
        alwaysPauseOnInterruption: true,
      });

      // Set the audio session category to allow playback in silent mode (iOS only)
      if (Platform.OS === 'ios') {
        await TrackPlayer.setCategory('playback', {
          ducking: true,
        });
      }
    };
    if (AppState.currentState === 'active') {
      setupPlayer();
    }
  }, []);
};
