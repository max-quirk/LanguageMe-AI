import React, { useState } from 'react';
import { ActivityIndicator, Dialog } from 'react-native-paper';
import tw from 'twrnc';
import { addFlashcard } from '../../../utils/flashcards';
import Button from '../../Button';
import Modal from '../../Modal';
import WordAndTranslations from '../../WordAndTranslations';

type DefinitionModalProps = {
  visible: boolean;
  word: string;
  onDismiss: () => void;
};

const DefinitionModal: React.FC<DefinitionModalProps> = ({ visible, word, onDismiss }) => {
  const [addToFlashcardsLoading, setAddToFlashcardsLoading] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAddToFlashcards = async () => {
    setAddToFlashcardsLoading(true);
    try {
      await addFlashcard({
        word,
        romanizedWord: null,
        wordLanguage: '', // You can update this as needed
        translateTo: '', // You can update this as needed
      });
      setAdded(true)
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
      <WordAndTranslations word={word} />
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
