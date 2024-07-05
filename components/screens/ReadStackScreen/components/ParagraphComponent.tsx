import React from 'react';
import { View } from 'react-native';
import tw from 'twrnc';
import WordComponent from './WordComponent';
import { useAudio } from '../../../../contexts/AudioContext';

type Props = {
  paragraph: string;
  paragraphIndex: number;
  handleWordPress: (word: string) => void;
  highlightedWordIndices: { paragraphIndex: number; wordIndex: number } | null;
};

const ParagraphComponent: React.FC<Props> = ({ paragraph, paragraphIndex, handleWordPress, highlightedWordIndices }) => {
  const { trackEnded } = useAudio()
  return (
    <View key={paragraphIndex} style={tw`flex-row flex-wrap mb-4`}>
      {paragraph.split(' ').map((word, wordIndex) => {
        const isHighlighted = trackEnded || Boolean(highlightedWordIndices &&
          (highlightedWordIndices.paragraphIndex > paragraphIndex ||
          (highlightedWordIndices.paragraphIndex === paragraphIndex && highlightedWordIndices.wordIndex >= wordIndex)));

        return (
          <WordComponent
            key={`${word}-${paragraphIndex}-${wordIndex}`}
            word={word}
            paragraphIndex={paragraphIndex}
            wordIndex={wordIndex}
            handleWordPress={handleWordPress}
            isHighlighted={isHighlighted}
          />
        )
      })}
    </View>
  )
};

export default ParagraphComponent;
