import React, { useState } from 'react';
import { View, Text } from 'react-native';
import tw from 'twrnc';
import Modal from '../../Modal';
import WordAndTranslations from '../../WordAndTranslations';
import RomanizeButton from '../../RomanizeButton';
import { useTheme } from '../../../contexts/ThemeContext';
import { FlashCard } from 'types';
import { getEaseColor } from '../../../utils/colors';
import Collapse from '../../Collapse';
import { Divider } from 'react-native-paper';

type WordModalProps = {
  visible: boolean;
  word: string;
  flashcard: FlashCard;
  onDismiss: () => void;
};

const WordModal: React.FC<WordModalProps> = ({ visible, word, flashcard, onDismiss }) => {
  const { theme, isDarkTheme } = useTheme();
  const [showRomanized, setShowRomanized] = useState(false);
  const _exampleRomanized = flashcard.front.exampleRomanized;

  return (
    <Modal visible={visible} onDismiss={onDismiss}>
      <WordAndTranslations word={word} />
      <Divider style={tw`my-4`} />
      <Collapse label="Example">
        <View style={tw`mt-0 flex-row items-center pb-2`}>
          {_exampleRomanized && (
            <RomanizeButton show={!showRomanized} onPress={() => setShowRomanized(!showRomanized)} />
          )}
          <Text style={tw`text-base ${theme.classes.textPrimary}`}>
            {showRomanized ? _exampleRomanized : flashcard.front.example}
          </Text>
        </View>
        <Text style={tw`mt-0 text-base ${theme.classes.textSecondary} ${_exampleRomanized ? 'pl-12' : ''}`}>
          {flashcard.back.example}
        </Text>
      </Collapse>
      <Divider style={tw`my-4`} />
      <View style={tw`mt-4 flex flex-row justify-between mt-10`}>
        <Text style={tw`text-base ${theme.classes.textPrimary} font-medium`}># Reviews: {flashcard.reps}</Text>
        {flashcard.reps > 0 ? (
          <View style={tw`flex flex-row items-center justify-center`}>
            <Text style={tw`text-base font-medium ${theme.classes.textPrimary}`}>
              Ease: 
            </Text>
            <View style={tw`w-6 h-6 ml-3 rounded-sm ${getEaseColor(flashcard.lastEase, isDarkTheme)}`} />
          </View>
        ) : null}
      </View>
    </Modal>
  );
};

export default WordModal;
