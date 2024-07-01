import React from 'react';
import { ScrollView, RefreshControl, ScrollViewProps } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

type RefreshableScrollViewProps = ScrollViewProps & {
  refreshing: boolean;
  onRefresh: () => void;
};

const RefreshableScrollView: React.FC<RefreshableScrollViewProps> = ({
  refreshing,
  onRefresh,
  children,
  ...props
}) => {
  const { theme } = useTheme();

  return (
    <ScrollView
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh} 
          tintColor={theme.colors.purplePrimary} 
          colors={[theme.colors.purplePrimary]} // Need for Android
        />
      }
      {...props}
    >
      {children}
    </ScrollView>
  );
};

export default RefreshableScrollView;
