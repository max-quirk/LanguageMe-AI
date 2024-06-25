import React, { useContext, useState, useEffect } from 'react';
import { Text, ScrollView, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../../types';
import { Dialog, Paragraph, Portal, ActivityIndicator } from 'react-native-paper';
import { LanguageContext } from '../../../contexts/LanguageContext';
import { getPossibleTranslations } from '../../../services/chatGpt';
import { addFlashcard } from '../../../utils/flashcards';
import { cleanPunctuation } from '../../../utils/readings';
import HelperPopup from '../../HelperPopup';
import { isFirstTimeUser } from '../../../utils/storageUtils';
import Button from '../../Button';

type ReadingScreenRouteProp = RouteProp<RootStackParamList, 'Reading'>;

type Props = {
  route: ReadingScreenRouteProp;
};

const ReadingScreen: React.FC<Props> = ({ route }) => {
  const { nativeLanguage, targetLanguage } = useContext(LanguageContext);
  const { reading } = route.params;
  const [visible, setVisible] = useState(false);
  const [selectedWord, setSelectedWord] = useState<string>('');
  const [definitionLoading, setDefinitionLoading] = useState(false);
  const [addToFlashcardsLoading, setAddToFlashcardsLoading] = useState(false);
  const [translations, setTranslations] = useState<string[]>([]);
  const [added, setAdded] = useState(false);
  const [helperVisible, setHelperVisible] = useState(false);

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

  const handleWordPress = async (word: string) => {
    const cleanedWord = cleanPunctuation(word);
    setSelectedWord(cleanedWord);
    setVisible(true);
    setDefinitionLoading(true);
    setTranslations([]);
    try {
      const translationsList = await getPossibleTranslations({ word: cleanedWord, translateTo: nativeLanguage });
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

  const handleAddToFlashcards = async () => {
    setAddToFlashcardsLoading(true);
    try {
      await addFlashcard({ word: selectedWord, language: targetLanguage, translateTo: nativeLanguage });
      setAdded(true);
    } catch (error) {
      console.error('Error adding flashcard:', error);
    }
    setAddToFlashcardsLoading(false);
  };

  const renderWord = (word: string, index: number) => (
    <TouchableOpacity key={`${word}-${index}`} onPress={() => handleWordPress(word)}>
      <Text style={tw`text-lg`}>{word} </Text>
    </TouchableOpacity>
  );

  const renderLine = (line: string, lineIndex: number) => (
    <View key={lineIndex} style={tw`flex-row flex-wrap`}>
      {line.split(' ').map((word, wordIndex) => renderWord(word, wordIndex))}
    </View>
  );

  const handleModalClose = () => {
    setVisible(false);
    setAddToFlashcardsLoading(false)
    setAdded(false);
  };
  
  return (
    <View style={tw`flex-1 px-5`}>
      <ScrollView style={tw`flex-1 px-5 pt-20`}>
        <Text style={tw`text-2xl mb-4`}>{reading.description}</Text>
        <View style={tw`mb-25`}>{reading.passage?.split('\n').map((line, index) => renderLine(line, index))}</View>
        <HelperPopup
          title="How to use"
          text="Tap any word you don't know to see its definition and add it to your flashcards."
          visible={helperVisible}
          onClose={() => setHelperVisible(false)}
        />
        <Portal>
          <Dialog visible={visible} onDismiss={handleModalClose}>
            <Dialog.Title style={tw`capitalize`}>{selectedWord}</Dialog.Title>
            <Dialog.Content>
              {definitionLoading ? (
                <ActivityIndicator style={tw`py-10`} size="large" />
              ) : (
                <Paragraph style={tw`pl-4`}>
                  {translations.length > 0 ? (
                    <>
                      {translations.map((translation, index) => (
                        <Text style={tw`text-base`} key={index}>&#8226; {translation.trim()}{'\n'}</Text>
                      ))}
                    </>
                  ) : (
                    'No translations found.'
                  )}
                </Paragraph>
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
                ) : (
                  added ? 'Added' : 'Add to Flashcards'
                )}
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </ScrollView>
    </View>
  );
};

export default ReadingScreen;
