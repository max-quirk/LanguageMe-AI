import { NavigatorScreenParams } from "@react-navigation/native";
import { LanguageCode } from "iso-639-1";
import { ReadingWithWordTimeStamps, WordSegment } from "services/whisper";
import { Ease } from "utils/flashcards";

export type MainTabParamList = {
  Home: undefined;
  Read: undefined;
  Learn: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Main: NavigatorScreenParams<MainTabParamList>; 
  Register: undefined;
  LanguageSelection: undefined;
  TargetLanguageSelection: { nativeLanguage: LanguageCode };
  ReadingsList: undefined;
  AddReading: undefined;
  Reading: {
    reading: Reading;
  };
  Login: undefined;
};


export type FlashCard = {
  id: string,
  front: {
    word: string,
    wordRomanized: string,
    example: string,
    exampleRomanized: string,
  },
  back: {
    word: string,
    example: string
  },
  due: Date,
  created: Date,
  interval: number,
  factor: number,
  reps: number,
  firstMarkedEasy?: Date, 
  lastMarkedEasy?: Date,
  lastEase: Ease
}

export type Reading = {
  id: string;
  description: string;
  difficulty: string;
  wordCount: number;
  passage: string | null;
  createdAt: Date;
  wordTimestamps: ReadingWithWordTimeStamps | null
};
