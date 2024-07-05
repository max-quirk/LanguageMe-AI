import React, { useState, useEffect, useCallback } from 'react';
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
import { fetchFullFlashcard, storeTranslationsFirebase } from '../../../utils/flashcards';
import TextToSpeechButton from '../../TextToSpeechButton';
import { useTranslation } from 'react-i18next';

type WordModalProps = {
  visible: boolean;
  word: string;
  flashcard: LightWeightFlashCard;
  onDismiss: () => void;
};

const WordModal: React.FC<WordModalProps> = ({ visible, word, flashcard, onDismiss }) => {
  const { theme, isDarkTheme } = useTheme();
  const { t } = useTranslation();
  const [showRomanized, setShowRomanized] = useState(false);
  const [fullFlashcard, setFullFlashcard] = useState<FlashCard | null>(null);
  const [translationsList, setTranslationsList] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await fetchFullFlashcard(flashcard.id);
      setFullFlashcard(data);
      setTranslationsList(data ? data.translationsList : null);
      setLoading(false);
    };
    fetchData();
  }, [flashcard.id]);

  const setAndStoreTranslations = useCallback(async (_translationsList: string[]) => {
    setTranslationsList(_translationsList);
    await storeTranslationsFirebase(flashcard.id, _translationsList);
  }, [flashcard.id]);

  return (
    <Modal visible={visible} onDismiss={onDismiss}>
      <WordAndTranslations 
        word={word} 
        translationsList={translationsList}
        setTranslationsList={setAndStoreTranslations}
        wordLoading={loading}
      />
      <Divider style={tw`my-4`} />
      <Collapse 
        label={t('example')} 
        contentStyle={tw`pb-2 pr-2`}
      >
        <View style={tw`mt-0 flex-row items-center`}>
          {!loading && fullFlashcard?.front.exampleRomanized && (
            <RomanizeButton show={!showRomanized} onPress={() => setShowRomanized(!showRomanized)} />
          )}
          {loading ? (
            <ActivityIndicator size="small" color={theme.colors.purplePrimary} />
          ) : (
            <View style={tw`flex flex-row flex-wrap`}>
              <Text style={tw`text-base ${theme.classes.textPrimary} mr-2`}>
                {showRomanized ? fullFlashcard?.front.exampleRomanized : fullFlashcard?.front.example}
                <TextToSpeechButton
                  type='flashcard' 
                  text={`${word}. ${fullFlashcard?.front.example}`} 
                  id={flashcard?.id ?? `flashcard_${word}`} 
                  size={20}
                  style={tw`pl-2 h-5`}
                />
              </Text>
            </View>
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
          <Text style={tw`text-base ${theme.classes.textPrimary} font-medium`}>{t('reviews')}: {fullFlashcard?.reps}</Text>
        )}
        {fullFlashcard?.reps && fullFlashcard.reps > 0 ? (
          <View style={tw`flex flex-row items-center justify-center`}>
            <Text style={tw`text-base font-medium ${theme.classes.textPrimary}`}>
              {t('ease')}: 
            </Text>
            {loading ? (
              <ActivityIndicator size="small" color={theme.colors.purplePrimary} />
            ) : (
              <View style={tw`w-6 h-6 ml-3 rounded-sm ${fullFlashcard.lastEase ? getEaseColor(fullFlashcard.lastEase, isDarkTheme): ''}`} />
            )}
          </View>
        ) : null}
      </View>
    </Modal>
  );
};

export default WordModal;
