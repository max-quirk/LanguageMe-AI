import { NavigatorScreenParams } from "@react-navigation/native";
import { LanguageCode } from "iso-639-1";
import { ReadingWithWordTimeStamps } from "services/whisper";
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
    reading?: Reading;
    readingId: string;
  };
  Login: undefined;
};


export type FlashCard = {
  id: string,
  front: {
    word: string,
    wordRomanized: string | null,
    example: string,
    exampleRomanized: string | null,
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
  lastEase: Ease | null
  translationsList: string[] | null
}

export type LightWeightFlashCard = {
  id: string,
  front: {
    word: string,
    wordRomanized: string,
  },
  back: {
    word: string,
  },
  created: Date,
};

export type Reading = {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  wordCount: number;
  passage: string | null;
  createdAt: Date;
  wordTimestamps: ReadingWithWordTimeStamps | null
};
