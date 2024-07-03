import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Text, ScrollView, View } from 'react-native';
import tw from 'twrnc';
import { RouteProp, useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../../../types';
import HelperPopup from '../../HelperPopup';
import DefinitionModal from './components/DefinitionModal';
import ReadingSpeakerSlider from '../../ReadingSpeakerSlider';
import { useAudio } from '../../../contexts/AudioContext';
import { useTheme } from '../../../contexts/ThemeContext';
import TrackPlayer, { useProgress } from 'react-native-track-player';
import { getWordTimeStamps } from '../../../services/whisper';
import { cleanPunctuation, updateFirebaseReadingWordTimestamps } from '../../../utils/readings';
import { isFirstTimeUser } from '../../../utils/storageUtils';
import ParagraphComponent from './components/ParagraphComponent';
import { LanguageContext } from '../../../contexts/LanguageContext';

type ReadingScreenRouteProp = RouteProp<RootStackParamList, 'Reading'>;

type Props = {
  route: ReadingScreenRouteProp;
};

const READING_PING_TIME_MS = 50;

const ReadingScreen: React.FC<Props> = ({ route }) => {
  const { reading } = route.params;
  const [definitionModalVisible, setDefinitionModalVisible] = useState(false);
  const [selectedWord, setSelectedWord] = useState<string>('');
  const [highlightedWordIndices, setHighlightedWordIndices] = useState<{ paragraphIndex: number; wordIndex: number } | null>(null);
  const [helperVisible, setHelperVisible] = useState(false);
  const [pausedToOpenDefinition, setPausedToOpenDefinition] = useState(false);

  const { targetLanguage } = useContext(LanguageContext);

  const { 
    pauseAudio, 
    resumeAudio, 
    playing, 
    currentFile: audioFile,
    currentFileWordTimestamps: wordTimestamps,
    setCurrentFileWordTimestamps: setWordTimestamps
  } = useAudio();
  const { position } = useProgress(READING_PING_TIME_MS);

  const { theme } = useTheme();

  useEffect(() => {
    setWordTimestamps(reading.wordTimestamps);

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

  useEffect(() => {
    const fetchTranscription = async () => {
      if (audioFile && reading.passage) { //&& !wordTimestamps
        try {
          const readingWithWordTimeStamps = await getWordTimeStamps({
            audioUrl: audioFile, 
            languageCode: targetLanguage,
            passage: reading.passage,
          });
          await updateFirebaseReadingWordTimestamps(reading.id, readingWithWordTimeStamps);
          setWordTimestamps(readingWithWordTimeStamps);
        } catch (error) {
          console.error('Error fetching transcription:', error);
        }
      }
    };

    fetchTranscription();
  }, [audioFile]);

  useEffect(() => {
    if (wordTimestamps) {
      const interval = setInterval(() => {
        updateHighlightedWordIndices(position);
      }, READING_PING_TIME_MS);

      return () => clearInterval(interval);
    }
  }, [position, wordTimestamps]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        // When screen is unfocused, pause the audio
        if (playing) {
          pauseAudio();
        }
      };
    }, [playing, pauseAudio])
  );

  const handleWordPress = (word: string) => {
    const cleanedWord = cleanPunctuation(word);
    setSelectedWord(cleanedWord);
    setDefinitionModalVisible(true);
    if (playing) {
      pauseAudio();
      setPausedToOpenDefinition(true);
    }
  };

  const handleDefinitionModalClose = () => {
    setDefinitionModalVisible(false);
    if (position > 0 && pausedToOpenDefinition) {
      // rewind track 1s
      const newPosition = Math.max(position - 1, 0);
      TrackPlayer.seekTo(newPosition);
      setTimeout(() => {
        resumeAudio();
        setPausedToOpenDefinition(false);
      }, 500);
    }
  };

  const updateHighlightedWordIndices = (currentPosition: number) => {
    const adjustedPosition = currentPosition + 0.4 // make words highlight slightly early 
    if (wordTimestamps?.paragraphs) {
      for (let paragraphIndex = 0; paragraphIndex < wordTimestamps.paragraphs.length; paragraphIndex++) {
        const paragraph = wordTimestamps.paragraphs[paragraphIndex];

        for (let wordIndex = 0; wordIndex < paragraph.words.length; wordIndex++) {
          const word = paragraph.words[wordIndex];

          if (adjustedPosition >= word.start && adjustedPosition <= word.end) {
            setHighlightedWordIndices({ paragraphIndex, wordIndex });
            return;
          }
        }
      }
    }
  }
  return (
    <View style={tw`flex-1 ${theme.classes.backgroundPrimary} px-5`}>
      <ScrollView style={tw`flex-1 px-5 pt-20`}>
        <Text style={tw`text-2xl mb-4 ${theme.classes.textPrimary}`}>{reading.description}</Text>
        <View style={tw`mb-60`}>
          {reading.passage?.split('\n').map((line, index) => (
            <ParagraphComponent
              key={index}
              paragraph={line}
              paragraphIndex={index}
              handleWordPress={handleWordPress}
              highlightedWordIndices={highlightedWordIndices}
            />
          ))}
        </View>
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
