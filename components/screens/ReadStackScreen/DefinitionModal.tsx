import React, { useState, useEffect, useContext } from 'react';
import { Text, View } from 'react-native';
import { Paragraph, ActivityIndicator, Dialog } from 'react-native-paper';
import tw from 'twrnc';
import { LanguageContext } from '../../../contexts/LanguageContext';
import { getPossibleTranslations, romanizeText } from '../../../services/chatGpt';
import { addFlashcard } from '../../../utils/flashcards';
import { cleanLeadingHyphens, cleanPunctuation } from '../../../utils/readings';
import TextToSpeechButton from '../../TextToSpeechButton';
import Button from '../../Button';
import RomanizeButton from '../../RomanizeButton';
import { useTheme } from '../../../contexts/ThemeContext';
import Modal from '../../Modal';

type DefinitionModalProps = {
  visible: boolean;
  word: string;
  onDismiss: () => void;
};

const DefinitionModal: React.FC<DefinitionModalProps> = ({ visible, word, onDismiss }) => {
  const { nativeLanguage, targetLanguage, targetLanguageRomanizable } = useContext(LanguageContext);
  const [definitionLoading, setDefinitionLoading] = useState(false);
  const [addToFlashcardsLoading, setAddToFlashcardsLoading] = useState(false);
  const [translations, setTranslations] = useState<string[]>([]);
  const [romanized, setRomanized] = useState<string | null>(null);
  const [showRomanized, setShowRomanized] = useState(false);
  const [added, setAdded] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    const fetchTranslations = async () => {
      setDefinitionLoading(true);
      setTranslations([]);
      setRomanized(null);
      try {
        const translationsList = await getPossibleTranslations({
          word: cleanPunctuation(word),
          wordLanguage: targetLanguage,
          translateTo: nativeLanguage,
        });
        const translationsArray = translationsList
          ?.split('\n')
          .map(item => cleanLeadingHyphens(item))
          .filter(item => item !== '') ?? [];
        setTranslations(translationsArray);

        if (targetLanguageRomanizable) {
          const romanizedText = await romanizeText({ text: word, language: targetLanguage });
          setRomanized(romanizedText);
        }
      } catch (error) {
        console.error('Error fetching translations or romanized text:', error);
      }
      setDefinitionLoading(false);
    };

    if (visible) {
      fetchTranslations();
    }
  }, [visible, word, nativeLanguage]);

  const handleAddToFlashcards = async () => {
    setAddToFlashcardsLoading(true);
    try {
      await addFlashcard({
        word,
        romanizedWord: romanized,
        wordLanguage: targetLanguage,
        translateTo: nativeLanguage,
      });
      setAdded(true);
    } catch (error) {
      console.error('Error adding flashcard:', error);
    }
    setAddToFlashcardsLoading(false);
  };

  const handleDismiss = () => {
    setAdded(false);
    setShowRomanized(false);
    setAddToFlashcardsLoading(false);
    onDismiss();
  };

  return (
    <Modal visible={visible} onDismiss={handleDismiss}>
      <View style={tw`flex flex-row items-center pl-6 pr-2`}>
        {targetLanguageRomanizable && (
          <RomanizeButton show={!showRomanized} onPress={() => setShowRomanized(!showRomanized)} />
        )}
        <Dialog.Title style={tw`capitalize ${targetLanguageRomanizable ? 'ml-[-10px]' : ''} ${theme.classes.textPrimary}`}>
          {showRomanized ? (
            romanized ? romanized : <ActivityIndicator size="small" />
          ) : word}
        </Dialog.Title>
        <TextToSpeechButton text={word} id={word} type={'word'} />
      </View>
      <Dialog.Content>
        {definitionLoading ? (
          <ActivityIndicator style={tw`py-10`} size="large" />
        ) : (
          <View>
            <Paragraph style={tw`pl-4 ${theme.classes.textPrimary}`}>
              {translations.length > 0 ? (
                translations.map((translation, index) => (
                  <Text style={tw`text-base`} key={index}>
                    &#8226; {translation.trim()}
                    {'\n'}
                  </Text>
                ))
              ) : (
                'No translations found.'
              )}
            </Paragraph>
          </View>
        )}
      </Dialog.Content>
      <Dialog.Actions>
        <Button
          mode="contained"
          onPress={handleAddToFlashcards}
          style={tw`${added ? 'w-[160px] bg-grey-500' : 'w-[160px] bg-purple-600'}`}
          disabled={added || addToFlashcardsLoading}
        >
          {addToFlashcardsLoading ? (
            <ActivityIndicator style={tw`p-0 pt-1`} size={18} color="white" />
          ) : added ? (
            'Added'
          ) : (
            'Add to Flashcards'
          )}
        </Button>
      </Dialog.Actions>
    </Modal>
  );
};

export default DefinitionModal;
