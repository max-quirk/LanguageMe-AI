import React from 'react';
import { Button, Text } from 'react-native-paper';
import tw from 'twrnc';
import { Ease } from '../../../utils/flashcards';
import { formatInterval } from '../../../utils/time';
import { View } from 'react-native';

type FlashcardEaseButtonsProps = {
  cardNextIntervals: Record<Ease, number>;
  handleNextFlashcard: (ease: Ease) => void;
};

const FlashcardEaseButtons: React.FC<FlashcardEaseButtonsProps> = ({
  cardNextIntervals,
  handleNextFlashcard,
}) => {
  return (
    <View style={tw`flex flex-row`}>
      <Button mode="contained" style={tw`flex-basis-1/4 bg-red-400 h-13 rounded-l-lg rounded-r-none`} onPress={() => handleNextFlashcard(Ease.Again)}>
        <View style={tw`items-center`}>
          <Text style={tw`text-center`}>Again</Text>
          <Text style={tw`text-center`}>({formatInterval(cardNextIntervals[Ease.Again])})</Text>
        </View>
      </Button>
      <Button mode="contained" style={tw`flex-basis-1/4 bg-yellow-400 h-13 rounded-none`} onPress={() => handleNextFlashcard(Ease.Hard)}>
        <View style={tw`items-center`}>
          <Text style={tw`text-center`}>Hard</Text>
          <Text style={tw`text-center`}>({formatInterval(cardNextIntervals[Ease.Hard])})</Text>
        </View>
      </Button>
      <Button mode="contained" style={tw`flex-basis-1/4 bg-blue-300 h-13 rounded-none`} onPress={() => handleNextFlashcard(Ease.Good)}>
        <View style={tw`items-center`}>
          <Text style={tw`text-center`}>Mod</Text>
          <Text style={tw`text-center`}>({formatInterval(cardNextIntervals[Ease.Good])})</Text>
        </View>
      </Button>
      <Button mode="contained" style={tw`flex-basis-1/4 bg-green-400 h-13 rounded-l-none rounded-r-lg`} onPress={() => handleNextFlashcard(Ease.Easy)}>
        <View style={tw`items-center`}>
          <Text style={tw`text-center`}>Easy</Text>
          <Text style={tw`text-center`}>({formatInterval(cardNextIntervals[Ease.Easy])})</Text>
        </View>
      </Button>
    </View>
  );
};

export default FlashcardEaseButtons;
