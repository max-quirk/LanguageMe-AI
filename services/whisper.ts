import RNFS from 'react-native-fs';
import { FFmpegKit } from 'ffmpeg-kit-react-native';
import { LanguageCode } from 'iso-639-1';
import { filterBlankWords } from '../utils/readings';
import { approximateTimeStamps, processWordTimeStamps, wordTimeStampsReasonable } from '../utils/wordTimeStamps';

export interface WordSegment {
  start: number;
  end: number;
  word: string;
}

export type ParagraphWithWordTimeStamps = {
  words: WordSegment[];
};

export type ReadingWithWordTimeStamps = {
  paragraphs: ParagraphWithWordTimeStamps[];
};

export const getWordTimeStamps = async ({
  audioUrl,
  audioDuration,
  languageCode,
  passage,
  
}: {
  audioUrl: string, 
  audioDuration: number,
  languageCode: LanguageCode,
  passage: string,
}): Promise<ReadingWithWordTimeStamps | null> => {
  try {
    // Fetch the audio file from the URL
    const response = await fetch(audioUrl);
    const blob = await response.blob();

    // Read the blob as a base64 string
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    return new Promise((resolve, reject) => {
      reader.onloadend = async () => {
        try {
          const base64data = reader.result as string;
          const base64String = base64data.split(',')[1];
          const filePath = `${RNFS.DocumentDirectoryPath}/audio.wav`;
          const fileUri = `${RNFS.DocumentDirectoryPath}/convertedFile.wav`;

          // Write the base64 string to a file
          await RNFS.writeFile(filePath, base64String, 'base64');

          // Convert the audio file to the correct format and bitrate
          await FFmpegKit.execute(`-y -i ${filePath} -ar 16000 -ac 1 -c:a pcm_s16le ${fileUri}`);

          // Append the file directly to FormData
          const formData = new FormData();
          formData.append('file', {
            uri: `file://${fileUri}`,
            name: 'convertedFile.wav',
            type: 'audio/wav',
          });
          formData.append('model', 'whisper-1'); 
          formData.append('language', languageCode)
          formData.append('prompt', passage)
          formData.append('response_format', 'verbose_json');
          formData.append('timestamp_granularities[]', 'word');  

          const transcriptionResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
              'Content-Type': 'multipart/form-data'
            },
            body: formData,
          });
            
          const data = await transcriptionResponse.json();

          const filteredWords = data.words.filter((segment: WordSegment) => filterBlankWords(segment.word))

          let processedTimeStamps: ReadingWithWordTimeStamps | null = null;
          let timeStampsReasonable: boolean = false;

          try {
            processedTimeStamps = processWordTimeStamps({
              wordTimeStamps: filteredWords,
              passage
            });

            timeStampsReasonable = wordTimeStampsReasonable({
              readingTimeStamps: processedTimeStamps,
              audioDuration
            });
            if (!timeStampsReasonable) {
              console.info('Processed timestamps unreasonable. Approximating timestamps...`')
            }
          } catch (error) {
            console.info(`Error processing with Whisper: ${error}. Approximating timestamps...`);
          }

          // If the timestamps are not reasonable or processing failed, approximate them
          if (!timeStampsReasonable || !processedTimeStamps) {
            processedTimeStamps = approximateTimeStamps({
              passage,
              audioDuration,
            });
          }

          resolve(processedTimeStamps)
        } catch (innerError) {
          reject(innerError);
        }
      };
    });
  } catch (error) {
    console.info('Processing timestamps failed:', error);
    return null
  }
};
