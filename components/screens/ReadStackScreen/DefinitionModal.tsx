import React, { useState, useEffect, useContext } from 'react';
import { Text, ActivityIndicator, View } from 'react-native';
import { Dialog, Paragraph, Portal } from 'react-native-paper';
import tw from 'twrnc';
import { LanguageContext } from '../../../contexts/LanguageContext';
import { getPossibleTranslations } from '../../../services/chatGpt';
import { addFlashcard } from '../../../utils/flashcards';
import { cleanPunctuation } from '../../../utils/readings';
import TextToSpeechButton from '../../TextToSpeechButton'; 
import Button from '../../Button';
import { languageCodeToName } from 'utils/languages';

type DefinitionModalProps = {
  visible: boolean;
  word: string;
  onDismiss: () => void;
};

const DefinitionModal: React.FC<DefinitionModalProps> = ({ visible, word, onDismiss }) => {
  const { nativeLanguage, targetLanguage } = useContext(LanguageContext);
  const [definitionLoading, setDefinitionLoading] = useState(false);
  const [addToFlashcardsLoading, setAddToFlashcardsLoading] = useState(false);
  const [translations, setTranslations] = useState<string[]>([]);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const fetchTranslations = async () => {
      setDefinitionLoading(true);
      setTranslations([]);
      try {
        const translationsList = await getPossibleTranslations({ 
          word: cleanPunctuation(word), 
          wordLanguage: targetLanguage,
          translateTo: nativeLanguage,
        });
        const translationsArray = translationsList
          ?.split('\n')
          .map(item => cleanPunctuation(item))
          .filter(item => item !== '') ?? [];
        setTranslations(translationsArray);
      } catch (error) {
        console.error('Error fetching translations:', error);
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
      await addFlashcard({ word, wordLanguage: targetLanguage, translateTo: nativeLanguage });
      setAdded(true);
    } catch (error) {
      console.error('Error adding flashcard:', error);
    }
    setAddToFlashcardsLoading(false);
  };

  const handleDismiss = () => {
    setAdded(false);
    setAddToFlashcardsLoading(false);
    onDismiss();
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={handleDismiss}>
        <Dialog.Title style={tw`capitalize`}>
          {word}
          <TextToSpeechButton text={word} id={word} type={'word'} />
        </Dialog.Title>
        <Dialog.Content>
          {definitionLoading ? (
            <ActivityIndicator style={tw`py-10`} size="large" />
          ) : (
            <View>
              <Paragraph style={tw`pl-4`}>
                {translations.length > 0 ? (
                  <>
                    {translations.map((translation, index) => (
                      <Text style={tw`text-base`} key={index}>
                        &#8226; {translation.trim()}
                        {'\n'}
                      </Text>
                    ))}
                  </>
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
            style={tw`w-[160px]`}
            disabled={added || addToFlashcardsLoading}
          >
            {addToFlashcardsLoading ? (
              <ActivityIndicator style={tw`p-0 pt-1`} size={18} />
            ) : added ? (
              'Added'
            ) : (
              'Add to Flashcards'
            )}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

export default DefinitionModal;
