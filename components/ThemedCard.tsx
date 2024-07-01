import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Card, Paragraph, Title } from 'react-native-paper';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import tw from 'twrnc';
import { useTheme } from '../contexts/ThemeContext';

type ThemedCardProps = {
  onPress: () => void;
  renderRightActions?: () => JSX.Element;
  title: string | JSX.Element;
  description?: string | null;
};

const ThemedCard: React.FC<ThemedCardProps> = ({ onPress, renderRightActions, title, description }) => {
  const { theme } = useTheme();

  return (
    <Swipeable renderRightActions={renderRightActions}>
      <TouchableOpacity onPress={onPress}>
        <Card style={tw`mb-4 shadow-lg rounded-lg overflow-hidden ${theme.classes.backgroundTertiary} border ${theme.classes.borderPrimary}`}>
          <Card.Content>
            <Title style={tw`text-lg font-bold ${theme.classes.textPrimary}`}>{title}</Title>
            {description && (
              <Paragraph style={tw`text-gray-700 ${theme.classes.textSecondary}`} numberOfLines={1} ellipsizeMode="tail">
                {description}
              </Paragraph>
            )}
          </Card.Content>
        </Card>
      </TouchableOpacity>
    </Swipeable>
  );
};

export default ThemedCard;
