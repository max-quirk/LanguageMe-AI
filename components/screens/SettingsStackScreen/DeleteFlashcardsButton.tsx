import React from 'react';
import { View } from 'react-native';
import { firebase } from '../../../config/firebase';
import { deleteAllFlashcards } from '../../../utils/flashcards';
import tw from 'twrnc';
import Button from '../../Button';

const DeleteFlashcardsButton: React.FC = () => {

  const handleDeleteAllFlashcards = async () => {
    const user = firebase.auth().currentUser;
    if (user) {
      await deleteAllFlashcards(user.uid);
    } else {
      console.error('No user is authenticated');
    }
  };

  return (
    <View style={tw`p-5`}>
      <Button title="Delete All Flashcards" onPress={handleDeleteAllFlashcards} />
    </View>
  );
};

export default DeleteFlashcardsButton;
