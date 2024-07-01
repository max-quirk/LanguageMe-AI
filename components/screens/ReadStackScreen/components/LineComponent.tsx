import React from 'react';
import { View } from 'react-native';
import tw from 'twrnc';
import WordComponent from './WordComponent';

type Props = {
  line: string;
  lineIndex: number;
  handleWordPress: (word: string) => void;
  highlightedWordIndices: { paragraphIndex: number; wordIndex: number } | null;
};

const LineComponent: React.FC<Props> = ({ line, lineIndex, handleWordPress, highlightedWordIndices }) => (
  <View key={lineIndex} style={tw`flex-row flex-wrap mb-4`}>
    {line.split(' ').map((word, wordIndex) => (
      <WordComponent
        key={`${word}-${lineIndex}-${wordIndex}`}
        word={word}
        paragraphIndex={lineIndex}
        wordIndex={wordIndex}
        handleWordPress={handleWordPress}
        isHighlighted={highlightedWordIndices?.paragraphIndex === lineIndex && highlightedWordIndices?.wordIndex === wordIndex}
      />
    ))}
  </View>
);

export default LineComponent;
