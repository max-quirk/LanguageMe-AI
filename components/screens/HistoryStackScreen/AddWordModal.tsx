import React, { useState, useEffect, useCallback, useContext } from 'react';
import { View, Text } from 'react-native';
import tw from 'twrnc';
import Modal from '../../Modal';
import WordAndTranslations from '../../WordAndTranslations';
import RomanizeButton from '../../RomanizeButton';
import { useTheme } from '../../../contexts/ThemeContext';
import { LightWeightFlashCard, FlashCard } from 'types';
import { getEaseColor } from '../../../utils/colors';
import Collapse from '../../Collapse';
import { Divider, ActivityIndicator, Dialog } from 'react-native-paper';
import { addFlashcard, fetchFullFlashcard, storeTranslationsFirebase } from '../../../utils/flashcards';
import TextToSpeechButton from '../../TextToSpeechButton';
import { useTranslation } from 'react-i18next';
import { generateExampleSentences, getPossibleTranslations, romanizeText } from '../../../services/chatGpt';
import { LanguageContext } from '../../../contexts/LanguageContext';
import Button from '../../Button';
import { set } from 'lodash';

type WordModalProps = {
  visible: boolean;
  word: string;
  onDismiss: () => void;
};

const AddWordModal: React.FC<WordModalProps> = ({ visible, word, onDismiss }) => {
  const { theme, isDarkTheme } = useTheme();
  const { t } = useTranslation();
  const { nativeLanguage, targetLanguage, targetLanguageRomanizable } = useContext(LanguageContext);
  const [showRomanized, setShowRomanized] = useState(false);
  const [romanizedWord, setRomanizedWord] = useState<string | null>(null);
  const [romanizedExampleLoading, setRomanizedExampleLoading] = useState<boolean>(false);
  const [completeWordData, setCompleteWordData] = useState<FlashCard | null>(null);
  const [translationsList, setTranslationsList] = useState<string[] | null>(null);
  const [translationsLoading, setTranslationsLoading] = useState<boolean>(false); 
  const [exampleSentence, setExampleSentence] = useState<string | null>(null);
  const [translatedExampleSentence, setTranslatedExampleSentence] = useState<string | null>(null);
  const [exampleRomanized, setExampleRomanized] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const fetchExistingData = async() => {
      setCompleteWordData(null)//await fetchFlashcardFromWord(word));
    }
    const fetchAllData = async() => {
      setTranslationsLoading(true);
      setLoading(true);
      const translationList = await getPossibleTranslations({
        word,
        wordLanguage: targetLanguage,
        translateTo: nativeLanguage,
      });
      setTranslationsList(translationList)
      setTranslationsLoading(false)
      const { exampleSentence, translatedExampleSentence } = await generateExampleSentences({
        word,
        wordLanguage: targetLanguage,
        translateTo: nativeLanguage,
      });
      setExampleSentence(exampleSentence)
      setTranslatedExampleSentence(translatedExampleSentence)
      setLoading(false);
    }
    const wordAlreadyAdded = false //check firebase to see if word exists
    if (wordAlreadyAdded) {
      fetchExistingData();
    } else {
      fetchAllData();
    }
  }, [word]);

  const handleAddToFlashcards = async () => {
    setAdded(true);
    try {
      await addFlashcard({
        word,
        romanizedWord,
        wordLanguage: targetLanguage, 
        translateTo: nativeLanguage, 
        translationsList, 
      });
    } catch (error) {
      console.error('Error adding flashcard:', error);
    }
  };

  const handleDismiss = () => {
    setAdded(false);
    setTranslationsList(null);
    setCompleteWordData(null);
    setRomanizedWord(null);
    setExampleSentence(null);
    setTranslatedExampleSentence(null);
    setExampleRomanized(null);
    setShowRomanized(false)
    setLoading(false);
    setTranslationsLoading(false);
    onDismiss();
  };

  return (
    <Modal visible={visible} onDismiss={handleDismiss}>
      <WordAndTranslations 
        word={word} 
        romanizedWord={romanizedWord}
        setRomanizedWord={setRomanizedWord}
        translationsList={translationsList}
        setTranslationsList={setTranslationsList}
        wordLoading={translationsLoading}
      />
      <Divider style={tw`my-4`} />
      <Collapse 
        label={t('example')} 
        contentStyle={tw`pb-2 pr-2`}
      >
        <View style={tw`mt-0 flex-row items-center`}>
          {!loading && targetLanguageRomanizable && (
            <RomanizeButton 
              show={!showRomanized} 
              onPress={async () => {
                setShowRomanized(!showRomanized)
                if (!exampleRomanized && exampleSentence) {
                  setRomanizedExampleLoading(true)
                  const _exampleRomanized = await romanizeText({ text: exampleSentence, language: targetLanguage });
                  setExampleRomanized(_exampleRomanized)
                  setRomanizedExampleLoading(false)
                }
              }} />
          )}
          {loading ? (
            <ActivityIndicator size="small" color={theme.colors.purplePrimary} />
          ) : (
            <View style={tw`flex flex-row flex-wrap`}>
              <Text style={tw`text-base ${theme.classes.textPrimary} mr-10`}>
                {showRomanized ? 
                  <>
                    { romanizedExampleLoading ? 
                      <ActivityIndicator size="small" color={theme.colors.textPrimary} /> 
                    : 
                      <Text style={tw`text-base ${theme.classes.textPrimary} mr-2`}>{exampleRomanized}</Text> 
                    }
                  </>
                : 
                  <Text style={tw`text-base ${theme.classes.textPrimary} mr-2`}>{exampleSentence}</Text>
                }
                <TextToSpeechButton
                  type='flashcard' 
                  text={`${word}. ${exampleSentence}`} 
                  id={`flashcard_${word}`} 
                  size={20}
                  style={tw`pl-2 h-5`}
                />
              </Text>
            </View>
          )}
        </View>
        <Text style={tw`mt-0 text-base ${theme.classes.textSecondary} ${exampleRomanized ? 'pl-12' : ''}`}>
          {translatedExampleSentence}
        </Text>
      </Collapse>
      <Divider style={tw`my-4`} />
      <Dialog.Actions style={tw`mb-0 mt-10 pb-0 pr-0`}>
        <Button
          mode="contained"
          onPress={handleAddToFlashcards}
          style={tw`${added ? 'w-[160px] bg-gray-500' : 'w-[160px] bg-purple-600'}`}
          disabled={added}
        >
          <>
            {added ? (
              t(`added`)
            ) : (
              t(`add_to_flashcards`)
            )}
          </>
        </Button>
      </Dialog.Actions>
      {/* <View style={tw`mt-4 flex flex-row justify-between mt-8 pb-4`}>
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
      </View> */}
    </Modal>
  );
};

export default AddWordModal;
