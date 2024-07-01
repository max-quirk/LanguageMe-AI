import React, { useContext, useState, useEffect } from 'react';
import { ActivityIndicator, Dialog } from 'react-native-paper';
import tw from 'twrnc';
import { addFlashcard } from '../../../../utils/flashcards';
import Button from '../../../Button';
import Modal from '../../../Modal';
import WordAndTranslations from '../../../WordAndTranslations';
import { LanguageContext } from '../../../../contexts/LanguageContext';

type DefinitionModalProps = {
  visible: boolean;
  word: string;
  onDismiss: () => void;
};

const DefinitionModal: React.FC<DefinitionModalProps> = ({ visible, word, onDismiss }) => {
  const [addToFlashcardsLoading, setAddToFlashcardsLoading] = useState(false);
  const [added, setAdded] = useState(false);
  const [,setCantSwitchAddedUntilNextClick] = useState(false);
  
  const { nativeLanguage, targetLanguage } = useContext(LanguageContext);

  useEffect(() => {
    // Run when modal first opens
    if (visible) {
      // Ensure added is false when first opening modal
     setAdded(false);
     // Ensure added cant switch to true from a previous instance of the
     // modal just finishing its addFlashcard job
     setCantSwitchAddedUntilNextClick(true)
   }
  }, [visible]);

  const handleAddToFlashcards = async () => {
    setCantSwitchAddedUntilNextClick(false);
    setAddToFlashcardsLoading(true);
    try {
      await addFlashcard({
        word,
        romanizedWord: null,
        wordLanguage: targetLanguage, 
        translateTo: nativeLanguage, 
      });
      setCantSwitchAddedUntilNextClick((prev) => {
        if (!prev) {
          setAdded(true);
        }
        return prev;
      });
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
    <Modal visible={visible} onDismiss={handleDismiss}>
      <WordAndTranslations word={word} style={tw`pb-6`}/>
      <Dialog.Actions style={tw`mb-0 pb-0 pr-0`}>
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
