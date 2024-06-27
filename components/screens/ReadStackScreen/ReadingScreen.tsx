import React, { useState, useEffect } from 'react';
import { Text, ScrollView, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../../types';
import HelperPopup from '../../HelperPopup';
import { isFirstTimeUser } from '../../../utils/storageUtils';
import DefinitionModal from './DefinitionModal';
import { cleanPunctuation } from '../../../utils/readings';
import ReadingSpeakerSlider from '../../ReadingSpeakerSlider';
import { useAudio } from '../../../contexts/AudioContext';

type ReadingScreenRouteProp = RouteProp<RootStackParamList, 'Reading'>;

type Props = {
  route: ReadingScreenRouteProp;
};

const ReadingScreen: React.FC<Props> = ({ route }) => {
  const { reading } = route.params;
  const [visible, setVisible] = useState(false);
  const [selectedWord, setSelectedWord] = useState<string>('');
  const [helperVisible, setHelperVisible] = useState(false);
  const { pauseAudio } = useAudio();

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
    setVisible(true);
    pauseAudio();
  };

  const renderWord = (word: string, index: number) => (
    <TouchableOpacity key={`${word}-${index}`} onPress={() => handleWordPress(word)}>
      <Text style={tw`text-lg`}>{word} </Text>
    </TouchableOpacity>
  );

  const renderLine = (line: string, lineIndex: number) => (
    <View key={lineIndex} style={tw`flex-row flex-wrap`}>
      {line.split(' ').map((word, wordIndex) => renderWord(word, wordIndex))}
    </View>
  );

  return (
    <View style={tw`flex-1 px-5`}>
      <ScrollView style={tw`flex-1 px-5 pt-20`}>
        <Text style={tw`text-2xl mb-4`}>{reading.description}</Text>
        <View style={tw`mb-60`}>{reading.passage?.split('\n').map((line, index) => renderLine(line, index))}</View>
        <HelperPopup
          title="How to use"
          text="Tap any word you don't know to see its definition and add it to your flashcards."
          visible={helperVisible}
          onClose={() => setHelperVisible(false)}
        />
        <DefinitionModal
          visible={visible}
          word={cleanPunctuation(selectedWord)}
          onDismiss={() => setVisible(false)}
        />
      </ScrollView>
      <ReadingSpeakerSlider reading={reading} />
    </View>
  );
};

export default ReadingScreen;
