import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ViewStyle, Alert } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import tw from 'twrnc';
import { FlashCard } from '../../../types';
import RomanizeButton from '../../RomanizeButton';
import { useTheme } from '../../../contexts/ThemeContext';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import { Dialog, Portal, Button } from 'react-native-paper';

type WordRowProps = {
  card: FlashCard;
  showTranslations: boolean;
  onPress: () => void;
  isFirst: boolean;
  isLast: boolean;
  onDelete: (id: string) => void;
};

const WordRow: React.FC<WordRowProps> = ({
  card,
  showTranslations,
  onPress,
  isFirst,
  isLast,
  onDelete,
}) => {
  const { theme } = useTheme();
  const [showRomanized, setShowRomanized] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const roundedTop: ViewStyle = { borderTopLeftRadius: 8, borderTopRightRadius: 8 };
  const roundedBottom: ViewStyle = { borderBottomLeftRadius: 8, borderBottomRightRadius: 8 };

  const handleDelete = () => {
    setConfirmVisible(false);
    onDelete(card.id);
  };

  const renderRightActions = () => (
    <View style={tw`flex-row items-center justify-end`}>
      <TouchableOpacity 
        onPress={() => (
          Alert.alert(
            'Confirm Deletion',
            'Are you sure you want to delete this word from your deck?',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: handleDelete },
            ]
          )
        )}
        style={tw`bg-red-600 p-3 rounded-lg`}
      >
        <MaterialCommunityIcons name="trash-can" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );

  return (
    <GestureHandlerRootView>
      <Portal>
        <Dialog visible={confirmVisible} onDismiss={() => setConfirmVisible(false)}>
          <Dialog.Title>Confirm Deletion</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to delete this flashcard?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirmVisible(false)}>Cancel</Button>
            <Button onPress={handleDelete}>Delete</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      <Swipeable renderRightActions={renderRightActions}>
        <TouchableOpacity
          onPress={onPress}
          style={[
            tw`overflow-hidden ${theme.classes.backgroundTertiary} border ${theme.classes.borderPrimary} ${isLast ? 'shadow-lg' : 'border-b-0'}`,
            isFirst ? roundedTop : null,
            isLast ? roundedBottom : null,
          ]}
        >
          <View
            style={[
              tw`flex-row items-center justify-between w-full pl-4 pr-3`,
              card.front.wordRomanized ? '' : tw`py-2`,
            ]}
          >
            <View style={tw`flex-row items-center`}>
              {card.front.wordRomanized && (
                <RomanizeButton show={!showRomanized} onPress={() => setShowRomanized(!showRomanized)} />
              )}
              <Text style={[tw`${theme.classes.textPrimary} text-lg`, showRomanized ? '' : tw`capitalize`]}>
                {showRomanized ? card.front.wordRomanized : card.front.word}
              </Text>
              {showTranslations && (
                <Text style={tw`ml-2 text-lg capitalize ${theme.classes.textSecondary}`}> / {card.back.word}</Text>
              )}
            </View>
            <MaterialCommunityIcons name="chevron-right" size={30} color={theme.colors.textPrimary} />
          </View>
        </TouchableOpacity>
      </Swipeable>
    </GestureHandlerRootView>
  );
};

export default WordRow;
