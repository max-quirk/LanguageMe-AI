import React, { useState, useEffect, useCallback } from 'react';
import { Text, ScrollView, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';
import { RouteProp, useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../../../types';
import HelperPopup from '../../HelperPopup';
import { isFirstTimeUser } from '../../../utils/storageUtils';
import DefinitionModal from './DefinitionModal';
import { cleanPunctuation, extractPunctuation } from '../../../utils/readings';
import ReadingSpeakerSlider from '../../ReadingSpeakerSlider';
import { useAudio } from '../../../contexts/AudioContext';
import { useTheme } from '../../../contexts/ThemeContext';
import TrackPlayer, { useProgress } from 'react-native-track-player';
import { WordSegment, getWordTimeStamps } from '../../../services/whisper';
import { ActivityIndicator } from 'react-native-paper';
import { updateFirebaseReadingWordTimestamps } from '../../../utils/readings';

type ReadingScreenRouteProp = RouteProp<RootStackParamList, 'Reading'>;

type Props = {
  route: ReadingScreenRouteProp;
};

const READING_PING_TIME_MS = 100

const ReadingScreen: React.FC<Props> = ({ route }) => {
  const { reading } = route.params;
  const [definitionModalVisible, setDefinitionModalVisible] = useState(false);
  const [selectedWord, setSelectedWord] = useState<string>('');
  const [highlightedWordIndices, setHighlightedWordIndices] = useState<{ paragraphIndex: number; wordIndex: number } | null>(null);
  const [helperVisible, setHelperVisible] = useState(false);
  const [pausedToOpenDefinition, setPausedToOpenDefinition] = useState(false);
  const { pauseAudio, resumeAudio, playing, currentFile: audioFile } = useAudio();
  const { theme } = useTheme();
  const { position } = useProgress(READING_PING_TIME_MS);
  const [wordSegments, setWordSegments] = useState<WordSegment[] | null>(reading.wordTimestamps);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const fetchTranscription = async () => {
      if (audioFile && !wordSegments) {
        try {
          const segments = await getWordTimeStamps(audioFile);
          await updateFirebaseReadingWordTimestamps(reading.id, segments);
          setWordSegments(segments);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching transcription:', error);
        }
      }
    };

    fetchTranscription();
  }, [audioFile]);

  useEffect(() => {
    if (wordSegments?.length && wordSegments?.length > 0) {
      const interval = setInterval(() => {
        const currentSegment = wordSegments.find(
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
  }, [position, wordSegments]);
  

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

  const renderWord = (word: string, paragraphIndex: number, wordIndex: number) => {
    const { punctuationBefore, punctuationAfter, coreWord } = extractPunctuation(word);
    const isHighlighted = highlightedWordIndices?.paragraphIndex === paragraphIndex && highlightedWordIndices?.wordIndex === wordIndex;

    return (
      <View key={`${word}-${paragraphIndex}-${wordIndex}`} style={tw`flex-row`}>
        {punctuationBefore ? (
          <Text style={tw`text-xl leading-9 ${theme.classes.textPrimary}`}>{punctuationBefore}</Text>
        ) : null}
        <TouchableOpacity onPress={() => handleWordPress(coreWord)}>
          <Text
            style={tw`text-xl leading-9 ${
              isHighlighted ? `text-[${theme.colors.tomato}]` : theme.classes.textPrimary
            }`}
          >
            {coreWord}
          </Text>
        </TouchableOpacity>
        {punctuationAfter ? (
          <Text style={tw`text-xl leading-9 ${theme.classes.textPrimary}`}>{punctuationAfter}</Text>
        ) : null}
        <Text>{'\u00A0'}</Text>
      </View>
    );
  };

  const renderLine = (line: string, lineIndex: number) => (
    <View key={lineIndex} style={tw`flex-row flex-wrap mb-4`}>
      {line.split(' ').map((word, wordIndex) => renderWord(word, lineIndex, wordIndex))}
    </View>
  );

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
        {loading ? (
          <ActivityIndicator size="large" style={tw`mt-20`} />
        ) : (
          <View style={tw`mb-60`}>{reading.passage?.split('\n').map((line, index) => renderLine(line, index))}</View>
        )}
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
