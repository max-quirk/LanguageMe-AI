import { NavigatorScreenParams } from "@react-navigation/native";

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
  TargetLanguageSelection: { nativeLanguage: string };
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
    example: string,
  },
  back: {
    word: string,
    example: string
  },
  due: Date,
  interval: number,
  factor: number,
  reps: number,
  firstMarkedEasy?: Date, 
  lastMarkedEasy?: Date,
}

export type Reading = {
  id: string;
  description: string;
  difficulty: string;
  wordCount: string;
  passage: string | null;
  createdAt: Date;
};
