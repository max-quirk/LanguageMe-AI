import { Ease } from "./flashcards";

export const getEaseColor = (ease: Ease, isDarkTheme: boolean): string => {
  switch (ease) {
    case Ease.Again:
      return isDarkTheme ? 'bg-red-800' : 'bg-red-300';
    case Ease.Hard:
      return isDarkTheme ? 'bg-yellow-700' : 'bg-yellow-400';
    case Ease.Good:
      return isDarkTheme ? 'bg-blue-700' : 'bg-blue-300';
    case Ease.Easy:
      return isDarkTheme ? 'bg-green-700' : 'bg-green-400';
    default:
      return '';
  }
};
