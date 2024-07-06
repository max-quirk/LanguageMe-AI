import React, { useContext, useState, useEffect } from 'react';
import { ActivityIndicator, Dialog } from 'react-native-paper';
import tw from 'twrnc';
import { addFlashcard } from '../../../../utils/flashcards';
import Button from '../../../Button';
import Modal from '../../../Modal';
import WordAndTranslations from '../../../WordAndTranslations';
import { LanguageContext } from '../../../../contexts/LanguageContext';
import { useTranslation } from 'react-i18next';

type DefinitionModalProps = {
  visible: boolean;
  word: string;
  onDismiss: () => void;
};

const DefinitionModal: React.FC<DefinitionModalProps> = ({ visible, word, onDismiss }) => {
  const [added, setAdded] = useState(false);
  const [translationsList, setTranslationsList] = useState<string[] | null>(null)
  
  const { nativeLanguage, targetLanguage } = useContext(LanguageContext);
  const { t } = useTranslation()

  useEffect(() => {
    // Run when modal first opens
    setTranslationsList(null)
    if (visible) {
      // Ensure added is false when first opening modal
     setAdded(false);
   }
  }, [visible]);

  const handleAddToFlashcards = async () => {
    setAdded(true);
    try {
      await addFlashcard({
        word,
        romanizedWord: null,
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
    onDismiss();
  };

  return (
    <Modal visible={visible} onDismiss={handleDismiss}>
      <WordAndTranslations 
        word={word} 
        style={tw`pb-6`}
        translationsList={translationsList}
        setTranslationsList={setTranslationsList}
      />
      <Dialog.Actions style={tw`mb-0 pb-0 pr-0`}>
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
    </Modal>
  );
};

export default DefinitionModal;
