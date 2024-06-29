import React, { useState, useEffect } from 'react';
import { Text, ScrollView, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../../types';
import HelperPopup from '../../HelperPopup';
import { isFirstTimeUser } from '../../../utils/storageUtils';
import DefinitionModal from './DefinitionModal';
import { cleanPunctuation, splitTextIntoWords } from '../../../utils/readings';
import ReadingSpeakerSlider from '../../ReadingSpeakerSlider';
import { useAudio } from '../../../contexts/AudioContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { useProgress } from 'react-native-track-player';

type ReadingScreenRouteProp = RouteProp<RootStackParamList, 'Reading'>;

type Props = {
  route: ReadingScreenRouteProp;
};

const ReadingScreen: React.FC<Props> = ({ route }) => {
  const { reading } = route.params;
  const [definitionModalVisible, setDefinitionModalVisible] = useState(false);
  const [selectedWord, setSelectedWord] = useState<string>('');
  const [helperVisible, setHelperVisible] = useState(false);
  const [pausedToOpenDefintion, setPausedToOpenDefinition] = useState(false);
  const { pauseAudio, resumeAudio, playing } = useAudio();
  const { theme } = useTheme();
  const { position } = useProgress(100);

  useEffect(() => {
    const checkFirstTimeUser = async () => {
      const firstTime = await isFirstTimeUser();
      if (firstTime) {
        setTimeout(() => {
          setHelperVisible(true);
        }, 1000);
      }
    };
    checkFirstTimeUser();
  }, []);

  const handleWordPress = (word: string) => {
    const cleanedWord = cleanPunctuation(word);
    setSelectedWord(cleanedWord);
    setDefinitionModalVisible(true);
    if (playing) {
      pauseAudio();
      setPausedToOpenDefinition(true)
    }
  };

  const renderWord = (word: string, index: number) => (
    <TouchableOpacity key={`${word}-${index}`} onPress={() => handleWordPress(word)}>
      <Text style={tw`text-xl leading-9 ${theme.classes.textPrimary}`}>{word} </Text>
    </TouchableOpacity>
  );

  const renderLine = (line: string, lineIndex: number) => (
    <View key={lineIndex} style={tw`flex-row flex-wrap`}>
      {splitTextIntoWords(line).map((word, wordIndex) => renderWord(word, wordIndex))}
    </View>
  );

  const handleDefinitionModalClose = () => {
    setDefinitionModalVisible(false)
    if (position > 0 && pausedToOpenDefintion) {
      resumeAudio()
      setPausedToOpenDefinition(false)
    }
  }

  return (
    <View style={tw`flex-1 ${theme.classes.backgroundPrimary} px-5`}>
      <ScrollView style={tw`flex-1 px-5 pt-20`}>
        <Text style={tw`text-2xl mb-4 ${theme.classes.textPrimary}`}>{reading.description}</Text>
        <View style={tw`mb-60`}>{reading.passage?.split('\n').map((line, index) => renderLine(line, index))}</View>
        <HelperPopup
          title="How to use"
          text="Tap any word you don't know to see its definition and add it to your flashcards."
          visible={helperVisible}
          onClose={() => setHelperVisible(false)}
        />
        <DefinitionModal
          visible={definitionModalVisible}
          word={cleanPunctuation(selectedWord)}
          onDismiss={handleDefinitionModalClose}
        />
      </ScrollView>
      <ReadingSpeakerSlider reading={reading} />
    </View>
  );
};

export default ReadingScreen;
