import React from 'react';
import { Text, View } from 'react-native';
import tw from 'twrnc';
import { Ease } from '../../../utils/flashcards';
import Button from '../../Button';
import { useTheme } from '../../../contexts/ThemeContext';
import { getEaseColor } from '../../../utils/colors';

type FlashcardEaseButtonsProps = {
  handleNextFlashcard: (ease: Ease) => void;
};

const FlashcardEaseButtons: React.FC<FlashcardEaseButtonsProps> = ({ handleNextFlashcard }) => {
  const { theme, isDarkTheme } = useTheme();

  const buttonBaseStyle = tw`h-12`;
  const buttonContentStyle = tw`h-12 pt-[13px]`;
  const buttonLabelStyle = tw`w-full h-full`;

  return (
    <View style={tw`flex-row justify-between p-0 m-0`}>
      <View style={tw`flex-1 p-0 m-0`}>
        <Button
          mode="contained"
          style={[buttonBaseStyle, tw`rounded-l-lg rounded-r-none ${getEaseColor(Ease.Again, isDarkTheme)}`]}
          contentStyle={buttonContentStyle}
          labelStyle={buttonLabelStyle}
          onPress={() => handleNextFlashcard(Ease.Again)}
        >
          <Text style={tw`${theme.classes.textPrimary} text-center font-medium w-full`}>Forgot</Text>
        </Button>
      </View>
      <View style={tw`flex-1 p-0 m-0`}>
        <Button
          mode="contained"
          style={[buttonBaseStyle, tw`rounded-none ${getEaseColor(Ease.Hard, isDarkTheme)}`]}
          contentStyle={buttonContentStyle}
          labelStyle={buttonLabelStyle}
          onPress={() => handleNextFlashcard(Ease.Hard)}
        >
          <Text style={tw`${theme.classes.textPrimary} text-center font-medium w-full`}>Hard</Text>
        </Button>
      </View>
      <View style={tw`flex-1 p-0 m-0`}>
        <Button
          mode="contained"
          style={[buttonBaseStyle, tw`rounded-none ${getEaseColor(Ease.Good, isDarkTheme)}`]}
          contentStyle={buttonContentStyle}
          labelStyle={buttonLabelStyle}
          onPress={() => handleNextFlashcard(Ease.Good)}
        >
          <Text style={tw`${theme.classes.textPrimary} text-center font-medium w-full`}>Ok</Text>
        </Button>
      </View>
      <View style={tw`flex-1 p-0 m-0`}>
        <Button
          mode="contained"
          style={[buttonBaseStyle, tw`rounded-l-none rounded-r-lg ${getEaseColor(Ease.Easy, isDarkTheme)}`]}
          contentStyle={buttonContentStyle}
          labelStyle={buttonLabelStyle}
          onPress={() => handleNextFlashcard(Ease.Easy)}
        >
          <Text style={tw`${theme.classes.textPrimary} text-center font-medium w-full`}>Easy</Text>
        </Button>
      </View>
    </View>
  );
};

export default FlashcardEaseButtons;
