import React, { useState, useEffect, useCallback } from 'react';
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
import { WordSegment, getWordTimeStamps } from '../../../services/whisper';
import { cleanPunctuation, updateFirebaseReadingWordTimestamps } from '../../../utils/readings';
import { isFirstTimeUser } from '../../../utils/storageUtils';
import LineComponent from './components/LineComponent';

type ReadingScreenRouteProp = RouteProp<RootStackParamList, 'Reading'>;

type Props = {
  route: ReadingScreenRouteProp;
};

const READING_PING_TIME_MS = 100;

const ReadingScreen: React.FC<Props> = ({ route }) => {
  const { reading } = route.params;
  const [definitionModalVisible, setDefinitionModalVisible] = useState(false);
  const [selectedWord, setSelectedWord] = useState<string>('');
  const [highlightedWordIndices, setHighlightedWordIndices] = useState<{ paragraphIndex: number; wordIndex: number } | null>(null);
  const [helperVisible, setHelperVisible] = useState(false);
  const [pausedToOpenDefinition, setPausedToOpenDefinition] = useState(false);

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
    if (reading.wordTimestamps) {
      setWordTimestamps(reading.wordTimestamps);
    }
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
      if (audioFile && !wordTimestamps) {
        try {
          const segments = await getWordTimeStamps(audioFile);
          await updateFirebaseReadingWordTimestamps(reading.id, segments);
          setWordTimestamps(segments);
        } catch (error) {
          console.error('Error fetching transcription:', error);
        }
      }
    };

    fetchTranscription();
  }, [audioFile]);

  useEffect(() => {
    if (wordTimestamps?.length && wordTimestamps?.length > 0) {
      const interval = setInterval(() => {
        const currentSegment = wordTimestamps.find(
          segment => segment.start <= position && segment.end >= position
        );

        if (currentSegment && reading.passage) {
          const paragraphs = reading.passage.split('\n');
          const paragraphIndex = paragraphs.findIndex(paragraph =>
            paragraph.includes(currentSegment.text)
          );

          if (paragraphIndex !== -1) {
            const words = paragraphs[paragraphIndex].split(' ');
            const wordIndex = words.findIndex(word =>
              cleanPunctuation(word) === cleanPunctuation(currentSegment.text)
            );

            if (wordIndex !== -1) {
              setHighlightedWordIndices({ paragraphIndex, wordIndex });
            }
          }
        }
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

  return (
    <View style={tw`flex-1 ${theme.classes.backgroundPrimary} px-5`}>
      <ScrollView style={tw`flex-1 px-5 pt-20`}>
        <Text style={tw`text-2xl mb-4 ${theme.classes.textPrimary}`}>{reading.description}</Text>
        <View style={tw`mb-60`}>
          {reading.passage?.split('\n').map((line, index) => (
            <LineComponent
              key={index}
              line={line}
              lineIndex={index}
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
