import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Text, ScrollView, View } from 'react-native';
import tw from 'twrnc';
import { RouteProp, useFocusEffect } from '@react-navigation/native';
import { Reading, RootStackParamList } from '../../../types';
import HelperPopup from '../../HelperPopup';
import DefinitionModal from './components/DefinitionModal';
import ReadingSpeakerSlider from '../../ReadingSpeakerSlider';
import { useAudio } from '../../../contexts/AudioContext';
import { useTheme } from '../../../contexts/ThemeContext';
import TrackPlayer, { useProgress } from 'react-native-track-player';
import { getReading, processGeneratedReading } from '../../../utils/readings';
import { cleanPunctuation, updateFirebaseReadingWordTimestamps } from '../../../utils/readings';
import { isFirstTimeReadingUser, setFirstTimeReadingUser } from '../../../utils/storageUtils';
import ParagraphComponent from './components/ParagraphComponent';
import { LanguageContext } from '../../../contexts/LanguageContext';
import { ActivityIndicator } from 'react-native-paper';
import { getWordTimeStamps } from '../../../services/whisper';
import { useTranslation } from 'react-i18next';
import { useHardestWord } from '../../../services/chatGpt';

type ReadingScreenRouteProp = RouteProp<RootStackParamList, 'Reading'>;

type Props = {
  route: ReadingScreenRouteProp;
};

const READING_PING_TIME_MS = 50;

const ReadingScreen: React.FC<Props> = ({ route }) => {
  const { readingId, reading: paramsReading } = route.params;
  const [reading, setReading] = useState<Reading | undefined | null>(paramsReading);
  const [definitionModalVisible, setDefinitionModalVisible] = useState(false);
  const [selectedWord, setSelectedWord] = useState<string>('');
  const [highlightedWordIndices, setHighlightedWordIndices] = useState<{ paragraphIndex: number; wordIndex: number } | null>(null);
  const [helperVisible, setHelperVisible] = useState(false);
  const [pausedToOpenDefinition, setPausedToOpenDefinition] = useState(false);
  const [flashingWordIndex, setFlashingWordIndex] = useState<number | null>(null);

  const { targetLanguage } = useContext(LanguageContext);

  const { 
    pauseAudio, 
    resumeAudio, 
    playing, 
    currentFile: audioFile,
    currentFileWordTimestamps: wordTimestamps,
    setCurrentFileWordTimestamps: setWordTimestamps,
  } = useAudio();
  const { position, duration } = useProgress(READING_PING_TIME_MS);
  const { theme } = useTheme();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchReading = async () => {
      const fetchedReading = await getReading(readingId);
      setReading(fetchedReading);
    };
    if (!paramsReading) {
      fetchReading();
    }
  }, [readingId, paramsReading]);

  useEffect(() => {
    if (reading) {
      setWordTimestamps(reading.wordTimestamps);
    }

    const checkFirstTimeUser = async () => {
      const firstTime = await isFirstTimeReadingUser();
      if (firstTime) {
        const hardestWordIndex = await useHardestWord(reading?.passage ?? '');
        setTimeout(() => {
          setFlashingWordIndex(hardestWordIndex);
          setHelperVisible(true);
        }, 500);
      }
    };
    checkFirstTimeUser();
  }, [reading]);

  useEffect(() => {
    const fetchTranscription = async () => {
      if (audioFile && reading?.passage && duration) {
        try {
          const readingWithWordTimeStamps = await getWordTimeStamps({
            audioUrl: audioFile,
            languageCode: targetLanguage,
            passage: reading.passage,
          });
          await updateFirebaseReadingWordTimestamps(reading.id, readingWithWordTimeStamps);
          setWordTimestamps(readingWithWordTimeStamps);
        } catch (error) {
          await updateFirebaseReadingWordTimestamps(reading.id, null);
          console.info('Error fetching transcription:', error);
        }
      }
    };

    if (reading && !wordTimestamps) {
      fetchTranscription();
    }
  }, [audioFile, reading, wordTimestamps, duration]);

  useEffect(() => {
    if (wordTimestamps) {
      const interval = setInterval(() => {
        updateHighlightedWordIndices(position);
      }, READING_PING_TIME_MS);

      return () => clearInterval(interval);
    }
  }, [position, wordTimestamps]);

  const handleWordPress = (word: string) => {
    const cleanedWord = cleanPunctuation(word);
    setSelectedWord(cleanedWord);
    setDefinitionModalVisible(true);
    if (playing) {
      pauseAudio();
      setPausedToOpenDefinition(true);
    }
    // Stop helper flashing when any word is clicked
    setFlashingWordIndex(null);
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
    const adjustedPosition = currentPosition + 0.4; // make words highlight slightly early 
    if (wordTimestamps?.paragraphs) {
      for (let paragraphIndex = 0; paragraphIndex < wordTimestamps.paragraphs.length; paragraphIndex++) {
        const paragraph = wordTimestamps.paragraphs[paragraphIndex];

        for (let wordIndex = 0; wordIndex < paragraph.words.length; wordIndex++) {
          const word = paragraph.words[wordIndex];

          if (playing && adjustedPosition >= word.start && adjustedPosition <= word.end) {
            setHighlightedWordIndices({ paragraphIndex, wordIndex });
            return;
          }
        }
      }
    }
  }

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

  if (!reading) {
    return (
      <View style={tw`flex-1 justify-center items-center ${theme.classes.backgroundPrimary}`}>
        <ActivityIndicator size="large" color={theme.colors.purplePrimary} />
      </View>
    );
  }
  const passage = processGeneratedReading(reading.passage ?? '');
  return (
    <View style={tw`flex-1 ${theme.classes.backgroundPrimary} px-5`}>
      <ScrollView style={tw`flex-1 px-5 pt-20`}>
        <Text style={tw`text-2xl mb-4 ${theme.classes.textPrimary}`}>{reading.title}</Text>
        <View style={tw`mb-60`}>
          {passage.split('\n').map((line, index) => (
            <ParagraphComponent
              key={index}
              paragraph={line}
              paragraphIndex={index}
              handleWordPress={handleWordPress}
              highlightedWordIndices={highlightedWordIndices}
              flashingWordIndex={index === 0 ? flashingWordIndex : null}
            />
          ))}
        </View>
        <HelperPopup
          title={t('how_to_use')}
          text={t('tap_to_define')}
          visible={helperVisible}
          onClose={() => {
            setHelperVisible(false);
            setFirstTimeReadingUser(false);
          }}
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
