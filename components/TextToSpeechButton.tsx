import React, { useState, useEffect } from 'react';
import { TouchableOpacity } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import tw from 'twrnc';
import SoundPlayer from 'react-native-sound-player';
import { fetchSpeechUrl } from '../services/chatGpt';
import { useTheme } from '../contexts/ThemeContext';

type TextToSpeechButtonProps = {
  text: string;
  type: 'word' | 'flashcard' 
  id: string
  size?: number
};

const TextToSpeechButton: React.FC<TextToSpeechButtonProps> = ({ text, type, id, size=24 }) => {
  const [audioFile, setAudioFile] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isFirstClick, setIsFirstClick] = useState<boolean>(true);

  const { theme } = useTheme()

  useEffect(() => {
    // Reset states when the word changes
    setAudioFile(null);
    setLoading(false);
    setIsFirstClick(true);
  }, [text]);

  const fetchAudio = async () => {
    setLoading(true);
    const filePath = await fetchSpeechUrl({ text, type, id });
    if (filePath) {
      setAudioFile(filePath);
      setLoading(false);
      if (isFirstClick) {
        playAudio(filePath); // Automatically play audio once loaded after the first click
        setIsFirstClick(false);
      }
    }
  };

  const playAudio = (filePath: string) => {
    try {
      SoundPlayer.playUrl(filePath);
    } catch (error) {
      console.error('Failed to play the sound', error);
      Alert.alert('Error', 'Failed to play the sound. Please try again.');
    }
  };

  const handlePress = () => {
    if (audioFile) {
      playAudio(audioFile);
    } else if (!loading) {
      fetchAudio();
    }
  };

  return (
    <TouchableOpacity style={tw`flex-row items-center rounded w-12 h-12`} onPress={handlePress} disabled={loading}>
      {loading ? (
        <ActivityIndicator size="small" style={tw`mr-3`} />
      ) : (
        <MaterialCommunityIcons name="volume-high" size={size} color={theme.colors.textPrimary} />
      )}
    </TouchableOpacity>
  );
};

export default TextToSpeechButton;
