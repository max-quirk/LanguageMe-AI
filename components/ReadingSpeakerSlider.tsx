import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, ScrollView } from 'react-native';
import { ActivityIndicator, Menu } from 'react-native-paper';
import Fontisto from 'react-native-vector-icons/Fontisto';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import tw from 'twrnc';
import Slider from '@react-native-community/slider';
import { fetchSpeechUrl } from '../services/chatGpt';
import { Reading } from 'types';
import { useAudio } from '../contexts/AudioContext';
import TrackPlayer, { useProgress, usePlaybackState, State, useTrackPlayerEvents, Event } from 'react-native-track-player';
import { useTheme } from '../contexts/ThemeContext';

type ReadingSpeakerSliderProps = {
  reading: Reading;
};

const ReadingSpeakerSlider: React.FC<ReadingSpeakerSliderProps> = ({ reading }) => {
  const [showLoadingIcon, setShowLoadingIcon] = useState<boolean>(false);
  const [fetchingAudio, setFetchingAudio] = useState<boolean>(false);
  const [trackEnded, setTrackEnded] = useState<boolean>(false);
  const [speedControlVisible, setSpeedControlVisible] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const { playPauseAudio, currentFile, setCurrentFile, currentFileWordTimestamps } = useAudio();
  const playbackState = usePlaybackState();
  const { position, duration } = useProgress(50);
  const { theme } = useTheme();

  const isPlaying = playbackState.state === State.Playing;

  useEffect(() => {
    const fetchAudio = async () => {
      setFetchingAudio(true);
      const filePath = await fetchSpeechUrl({ text: reading.passage as string, type: 'reading', id: reading.id });
      if (filePath) {
        setCurrentFile(filePath);
        await TrackPlayer.reset();
        await TrackPlayer.add({
          id: reading.id,
          url: filePath,
          title: 'Reading Passage',
          artist: 'Unknown',
        });
        setFetchingAudio(false);
        setShowLoadingIcon(false);
      }
    };

    fetchAudio();

    return () => {
      TrackPlayer.stop();
      TrackPlayer.reset();
      setCurrentFile(null);
    };
  }, [reading.passage]);

  useTrackPlayerEvents([Event.PlaybackQueueEnded], () => {
    setTrackEnded(true);
  });

  const rewindAudio = async () => {
    const newPosition = Math.max(position - 5, 0);
    await TrackPlayer.seekTo(newPosition);
  };

  const fastForwardAudio = async () => {
    const newPosition = Math.min(position + 5, duration);
    await TrackPlayer.seekTo(newPosition);
  };

  const handleSliderChange = async (value: number) => {
    if (currentFile) {
      await TrackPlayer.seekTo(value * duration);
    }
  };

  const handlePlayPause = async () => {
    if (!currentFile || !currentFileWordTimestamps) {
      setShowLoadingIcon(true);
    } else {
      if (trackEnded) {
        await TrackPlayer.seekTo(0);
        await TrackPlayer.play();
        setTrackEnded(false);
      } else {
        playPauseAudio(currentFile);
      }
    }
  };

  const handleAudioReady = async () => {
    if (showLoadingIcon) {
      await TrackPlayer.play();
      setShowLoadingIcon(false);
    }
  };

  useEffect(() => {
    if (currentFile && currentFileWordTimestamps && showLoadingIcon) {
      handleAudioReady();
    }
  }, [currentFile, currentFileWordTimestamps, showLoadingIcon]);

  const handleRestart = async () => {
    if (currentFile) {
      await TrackPlayer.seekTo(0);
      if (isPlaying) {
        await TrackPlayer.play();
      }
    }
  };

  const handleSpeedChange = async (speed: number) => {
    setPlaybackSpeed(speed);
    await TrackPlayer.setRate(speed);
    setSpeedControlVisible(false);
  };

  const speedOptions = Array.from({ length: 11 }, (_, i) => 0.5 + i * 0.1);

  return (
    <View style={tw`absolute bottom-0 left-0 right-0 ${theme.classes.backgroundTertiary} p-4 border-t ${theme.classes.borderPrimary}`}>
      <Slider
        style={tw`w-full my-2`}
        minimumValue={0}
        maximumValue={1}
        value={duration ? position / duration : 0}
        onSlidingComplete={handleSliderChange}
        minimumTrackTintColor={theme.colors.purplePrimary}
        thumbTintColor={theme.colors.purplePrimary}
      />
      <View style={tw`flex-row justify-around items-center mb-2`}>
        <TouchableOpacity onPress={handleRestart} disabled={fetchingAudio}>
          <Fontisto name="step-backwrad" size={12} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={rewindAudio} disabled={fetchingAudio}>
          <MaterialCommunityIcons name="rewind-5" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handlePlayPause}>
          {showLoadingIcon ? (
            <ActivityIndicator size="small" />
          ) : (
            <MaterialCommunityIcons 
              name={trackEnded ? "restart" : isPlaying ? "pause" : "play"} 
              size={24} 
              color={theme.colors.textPrimary} 
            />
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={fastForwardAudio} disabled={fetchingAudio}>
          <MaterialCommunityIcons name="fast-forward-5" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Menu
          visible={speedControlVisible}
          onDismiss={() => setSpeedControlVisible(false)}
          anchor={
            <TouchableOpacity onPress={() => setSpeedControlVisible(true)}>
              <Text style={tw`text-xl ${theme.classes.textPrimary}`}>{playbackSpeed.toFixed(1)}x</Text>
            </TouchableOpacity>
          }
        >
          <ScrollView style={{ maxHeight: 200 }}>
            {speedOptions.map((option) => (
              <Menu.Item
                key={option.toFixed(1)}
                onPress={() => handleSpeedChange(option)}
                title={`${option.toFixed(1)}x`}
              />
            ))}
          </ScrollView>
        </Menu>
      </View>
    </View>
  );
};

export default ReadingSpeakerSlider;
