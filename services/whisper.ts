import RNFS from 'react-native-fs';
import { FFmpegKit } from 'ffmpeg-kit-react-native';
import { LanguageCode } from 'iso-639-1';
import { cleanPunctuation, filterBlankWords } from '../utils/readings';

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
  languageCode,
  passage
}: {
  audioUrl: string, 
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


          // Make the transcription request
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

          resolve(processWordTimeStamps({
            wordTimeStamps: filteredWords,
            passage
          }))
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

function processWordTimeStamps({
  wordTimeStamps,
  passage,
}: {
  wordTimeStamps: WordSegment[]
  passage: string
}): ReadingWithWordTimeStamps {
  const paragraphs = passage.split('\n').map(paragraph => paragraph.trim()).filter(paragraph => paragraph !== '');
  const result: ReadingWithWordTimeStamps = { paragraphs: [] };
  let timeStampsIndex = 0;

  paragraphs.forEach(paragraph => {
    const words = paragraph.split(' ').filter(filterBlankWords)
    const paragraphWords: WordSegment[] = [];

    for (let paragraphIndex = 0; paragraphIndex < words.length; paragraphIndex++) {
      if (paragraphWords.length > paragraphIndex) {
        continue
      }
      const _word = words[paragraphIndex]
      const word = cleanPunctuation(_word).toLowerCase()
      const timeStamp = wordTimeStamps[timeStampsIndex];

      const timeStampWord = cleanPunctuation(timeStamp.word.toLowerCase())

      if (timeStampWord === word) {
        paragraphWords.push({
          word: timeStampWord,
          start: timeStamp.start,
          end: timeStamp.end,
        });
        timeStampsIndex++
 
      } else if (timeStamp.word.length < word.length) {
        let buildTimeStampWord = timeStampWord
        let buildTimeStampIndex = timeStampsIndex + 1
        let end = timeStamp.end;
        while (buildTimeStampWord !== word && buildTimeStampIndex < wordTimeStamps.length) {
          const nextTimeStampWord = cleanPunctuation(wordTimeStamps[buildTimeStampIndex].word.toLowerCase())
          buildTimeStampWord += nextTimeStampWord;
          end = wordTimeStamps[buildTimeStampIndex].end;
          buildTimeStampIndex++;
        }
          paragraphWords.push({
            word: buildTimeStampWord,
            start: timeStamp.start,
            end,
          });
          timeStampsIndex = buildTimeStampIndex

      } else if (timeStamp.word.length > word.length) {
        let buildPassageWord = word
        let buildPassageWordIndex = paragraphIndex + 1
        while (buildPassageWord !== timeStamp.word && buildPassageWordIndex < words.length) {
          buildPassageWord += words[buildPassageWordIndex].toLowerCase();
          buildPassageWordIndex++;
        }
        const wordsInsideTimeStampWord = buildPassageWordIndex - paragraphIndex
        let t = timeStamp.start
        const timeStampLength = timeStamp.end - t
        for (let i = 0; i < wordsInsideTimeStampWord; i++) {
          const _word = words[i]
          const _wordApproxTimeLength = (_word.length / timeStampWord.length) * timeStampLength
          const _wordEnd = t + _wordApproxTimeLength
          paragraphWords.push({
            word: _word,
            start: t,
            end: _wordEnd
          });
          t = _wordEnd
        }
        timeStampsIndex++
      }
    }

    result.paragraphs.push({ words: paragraphWords });
  });

  return result;
}

// Filter out elements whose word is just punctuation
export function filterWordTimeStamps(wordTimeStamps: WordSegment[]) {
  const punctuationRegex = /^[.,;:!?。，；！？]+$/;
  const filteredWordTimeStamps = wordTimeStamps.filter(segment => !punctuationRegex.test(segment.word));
  return filteredWordTimeStamps;
}
