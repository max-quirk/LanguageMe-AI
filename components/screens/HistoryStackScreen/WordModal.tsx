import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import tw from 'twrnc';
import Modal from '../../Modal';
import WordAndTranslations from '../../WordAndTranslations';
import RomanizeButton from '../../RomanizeButton';
import { useTheme } from '../../../contexts/ThemeContext';
import { LightWeightFlashCard, FlashCard } from 'types';
import { getEaseColor } from '../../../utils/colors';
import Collapse from '../../Collapse';
import { Divider, ActivityIndicator } from 'react-native-paper';
import { fetchFullFlashcard } from '../../../utils/flashcards';

type WordModalProps = {
  visible: boolean;
  word: string;
  flashcard: LightWeightFlashCard;
  onDismiss: () => void;
};

const WordModal: React.FC<WordModalProps> = ({ visible, word, flashcard, onDismiss }) => {
  const { theme, isDarkTheme } = useTheme();
  const [showRomanized, setShowRomanized] = useState(false);
  const [fullFlashcard, setFullFlashcard] = useState<FlashCard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await fetchFullFlashcard(flashcard.id);
      setFullFlashcard(data);
      setLoading(false);
    };
    fetchData();
  }, [flashcard.id]);
  

  return (
    <Modal visible={visible} onDismiss={onDismiss}>
      <WordAndTranslations word={word} />
      <Divider style={tw`my-4`} />
      <Collapse 
        label="Example" 
        contentStyle={tw`pb-2`}
      >
        <View style={tw`mt-0 flex-row items-center`}>
          {!loading && fullFlashcard?.front.exampleRomanized && (
            <RomanizeButton show={!showRomanized} onPress={() => setShowRomanized(!showRomanized)} />
          )}
          {loading ? (
            <ActivityIndicator size="small" color={theme.colors.purplePrimary} />
          ) : (
            <Text style={tw`text-base ${theme.classes.textPrimary}`}>
              {showRomanized ? fullFlashcard?.front.exampleRomanized : fullFlashcard?.front.example}
            </Text>
          )}
        </View>
        <Text style={tw`mt-0 text-base ${theme.classes.textSecondary} ${fullFlashcard?.front.exampleRomanized ? 'pl-12' : ''}`}>
          {fullFlashcard?.back.example}
        </Text>
      </Collapse>
      <Divider style={tw`my-4`} />
      <View style={tw`mt-4 flex flex-row justify-between mt-8 pb-4`}>
        {loading ? (
          <ActivityIndicator size="small" color={theme.colors.purplePrimary} />
        ) : (
          <Text style={tw`text-base ${theme.classes.textPrimary} font-medium`}># Reviews: {fullFlashcard?.reps}</Text>
        )}
        {fullFlashcard?.reps && fullFlashcard.reps > 0 ? (
          <View style={tw`flex flex-row items-center justify-center`}>
            <Text style={tw`text-base font-medium ${theme.classes.textPrimary}`}>
              Ease: 
            </Text>
            {loading ? (
              <ActivityIndicator size="small" color={theme.colors.purplePrimary} />
            ) : (
              <View style={tw`w-6 h-6 ml-3 rounded-sm ${getEaseColor(fullFlashcard.lastEase, isDarkTheme)}`} />
            )}
          </View>
        ) : null}
      </View>
    </Modal>
  );
};

export default WordModal;
