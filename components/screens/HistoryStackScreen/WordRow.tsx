import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ViewStyle, Alert } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import tw from 'twrnc';
import { LightWeightFlashCard } from '../../../types';
import RomanizeButton from '../../RomanizeButton';
import { useTheme } from '../../../contexts/ThemeContext';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import { Dialog, Portal, Button } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

type WordRowProps = {
  card: LightWeightFlashCard;
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
  const { t } = useTranslation();
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
            t('confirm_deletion'),
            t('confirm_deletion_message'),
            [
              { text: t('cancel'), style: 'cancel' },
              { text: t('delete'), style: 'destructive', onPress: handleDelete },
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
          <Dialog.Title>{t('confirm_deletion')}</Dialog.Title>
          <Dialog.Content>
            <Text>{t('confirm_flashcard_deletion_message')}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirmVisible(false)}>{t('cancel')}</Button>
            <Button onPress={handleDelete}>{t('delete')}</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      <Swipeable renderRightActions={renderRightActions}>
        <TouchableOpacity
          onPress={onPress}
          style={[
            tw` ${theme.classes.backgroundTertiary} border ${theme.classes.borderPrimary} ${isLast ? 'shadow-lg' : 'border-b-0'}`,
            isFirst ? roundedTop : null,
            isLast ? roundedBottom : null,
          ]}
        >
          <View
            style={[
              tw`flex-row items-center justify-between w-full pl-4 pr-3`,
              card.front.wordRomanized ? {} : tw`py-2`,
            ]}
          >
            <View style={tw`flex-row items-center`}>
              {card.front.wordRomanized && (
                <RomanizeButton show={!showRomanized} onPress={() => setShowRomanized(!showRomanized)} />
              )}
              <Text style={[tw`${theme.classes.textPrimary} text-lg`, showRomanized ? {} : tw`capitalize`]}>
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
