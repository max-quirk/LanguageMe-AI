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
          // const filteredWords= [{"end": 0.23999999463558197, "start": 0, "word": "Il"}, {"end": 0.5600000023841858, "start": 0.23999999463558197, "word": "surf"}, {"end": 0.7400000095367432, "start": 0.5600000023841858, "word": "è"}, {"end": 0.9200000166893005, "start": 0.7400000095367432, "word": "poo"}, {"end": 1.2200000286102295, "start": 0.9200000166893005, "word": "sport"}, {"end": 1.8600000143051147, "start": 1.2200000286102295, "word": "acquatico"}, {"end": 2.5399999618530273, "start": 1.8600000143051147, "word": "emozionante"}, {"end": 3, "start": 2.5399999618530273, "word": "che"}, {"end": 3.5399999618530273, "start": 3, "word": "coinvolge"}, {"end": 4.019999980926514, "start": 3.5399999618530273, "word": "cavalcare"}, {"end": 4.400000095367432, "start": 4.019999980926514, "word": "le"}, {"end": 4.400000095367432, "start": 4.400000095367432, "word": "onde"}, {"end": 4.760000228881836, "start": 4.400000095367432, "word": "dell"}, {"end": 5, "start": 4.760000228881836, "word": "oceano"}, {"end": 5.360000133514404, "start": 5, "word": "su"}, {"end": 5.539999961853027, "start": 5.360000133514404, "word": "una"}, {"end": 5.880000114440918, "start": 5.539999961853027, "word": "tavola"}, {"end": 7.019999980926514, "start": 6.900000095367432, "word": "Richiede"}, {"end": 7.599999904632568, "start": 7.019999980926514, "word": "equilibrio"}, {"end": 8.239999771118164, "start": 8.239999771118164, "word": "forza"}, {"end": 8.420000076293945, "start": 8.239999771118164, "word": "e"}, {"end": 8.84000015258789, "start": 8.420000076293945, "word": "abilità"}, {"end": 9.5600004196167, "start": 9.479999542236328, "word": "I"}, {"end": 10.020000457763672, "start": 9.5600004196167, "word": "surfisti"}, {"end": 10.319999694824219, "start": 10.020000457763672, "word": "devono"}, {"end": 10.640000343322754, "start": 10.319999694824219, "word": "essere"}, {"end": 11.15999984741211, "start": 10.640000343322754, "word": "attenti"}, {"end": 11.460000038146973, "start": 11.15999984741211, "word": "alle"}, {"end": 11.9399995803833, "start": 11.460000038146973, "word": "condizioni"}, {"end": 12.460000038146973, "start": 11.9399995803833, "word": "del"}, {"end": 12.460000038146973, "start": 12.460000038146973, "word": "mare"}, {"end": 12.819999694824219, "start": 12.460000038146973, "word": "e"}, {"end": 12.9399995803833, "start": 12.819999694824219, "word": "alla"}, {"end": 13.199999809265137, "start": 12.9399995803833, "word": "loro"}, {"end": 14, "start": 13.199999809265137, "word": "sicurezza"}, {"end": 14.380000114440918, "start": 14.319999694824219, "word": "Le"}, {"end": 14.65999984741211, "start": 14.380000114440918, "word": "spiagge"}, {"end": 15.100000381469727, "start": 14.65999984741211, "word": "famose"}, {"end": 15.300000190734863, "start": 15.100000381469727, "word": "per"}, {"end": 15.520000457763672, "start": 15.300000190734863, "word": "il"}, {"end": 15.699999809265137, "start": 15.520000457763672, "word": "surf"}, {"end": 16.139999389648438, "start": 15.699999809265137, "word": "includono"}, {"end": 16.459999084472656, "start": 16.139999389648438, "word": "luoghi"}, {"end": 16.68000030517578, "start": 16.459999084472656, "word": "come"}, {"end": 17.139999389648438, "start": 16.68000030517578, "word": "Hawaii"}, {"end": 17.920000076293945, "start": 17.6200008392334, "word": "Australia"}, {"end": 18.139999389648438, "start": 17.920000076293945, "word": "e"}, {"end": 18.65999984741211, "start": 18.139999389648438, "word": "California"}, {"end": 19.5, "start": 19.399999618530273, "word": "Ogni"}, {"end": 19.700000762939453, "start": 19.5, "word": "onda"}, {"end": 19.940000534057617, "start": 19.700000762939453, "word": "è"}, {"end": 20.280000686645508, "start": 19.940000534057617, "word": "unica"}, {"end": 20.639999389648438, "start": 20.280000686645508, "word": "e"}, {"end": 20.780000686645508, "start": 20.639999389648438, "word": "offre"}, {"end": 20.979999542236328, "start": 20.780000686645508, "word": "una"}, {"end": 21.219999313354492, "start": 20.979999542236328, "word": "nuova"}, {"end": 21.579999923706055, "start": 21.219999313354492, "word": "sfida"}, {"end": 22.600000381469727, "start": 22.540000915527344, "word": "Molti"}, {"end": 23.139999389648438, "start": 22.600000381469727, "word": "surfisti"}, {"end": 23.479999542236328, "start": 23.139999389648438, "word": "trovano"}, {"end": 23.860000610351562, "start": 23.479999542236328, "word": "pace"}, {"end": 24.31999969482422, "start": 23.860000610351562, "word": "e"}, {"end": 24.399999618530273, "start": 24.31999969482422, "word": "libertà"}, {"end": 24.600000381469727, "start": 24.399999618530273, "word": "nell"}, {"end": 24.979999542236328, "start": 24.600000381469727, "word": "oceano"}, {"end": 25.639999389648438, "start": 25.520000457763672, "word": "Il"}, {"end": 25.84000015258789, "start": 25.639999389648438, "word": "surf"}, {"end": 26.079999923706055, "start": 25.84000015258789, "word": "può"}, {"end": 26.299999237060547, "start": 26.079999923706055, "word": "essere"}, {"end": 26.860000610351562, "start": 26.299999237060547, "word": "praticato"}, {"end": 27.020000457763672, "start": 26.860000610351562, "word": "a"}, {"end": 27.219999313354492, "start": 27.020000457763672, "word": "livello"}, {"end": 27.780000686645508, "start": 27.219999313354492, "word": "amatoriale"}, {"end": 28.079999923706055, "start": 27.780000686645508, "word": "o"}, {"end": 29.18000030517578, "start": 28.079999923706055, "word": "professionale"}, {"end": 29.899999618530273, "start": 29.420000076293945, "word": "Competizioni"}, {"end": 30.219999313354492, "start": 29.899999618530273, "word": "di"}, {"end": 30.479999542236328, "start": 30.219999313354492, "word": "surf"}, {"end": 31.079999923706055, "start": 30.479999542236328, "word": "attirano"}, {"end": 31.739999771118164, "start": 31.079999923706055, "word": "appassionati"}, {"end": 31.979999542236328, "start": 31.739999771118164, "word": "da"}, {"end": 32.18000030517578, "start": 31.979999542236328, "word": "tutto"}, {"end": 32.52000045776367, "start": 32.18000030517578, "word": "il"}, {"end": 32.68000030517578, "start": 32.52000045776367, "word": "mondo"}, {"end": 33.70000076293945, "start": 33.63999938964844, "word": "Il"}, {"end": 33.939998626708984, "start": 33.70000076293945, "word": "surf"}, {"end": 34.18000030517578, "start": 33.939998626708984, "word": "è"}, {"end": 34.29999923706055, "start": 34.18000030517578, "word": "più"}, {"end": 34.47999954223633, "start": 34.29999923706055, "word": "di"}, {"end": 34.619998931884766, "start": 34.47999954223633, "word": "uno"}, {"end": 35.060001373291016, "start": 34.619998931884766, "word": "sport"}, {"end": 35.29999923706055, "start": 35.29999923706055, "word": "È"}, {"end": 35.47999954223633, "start": 35.29999923706055, "word": "uno"}, {"end": 35.65999984741211, "start": 35.47999954223633, "word": "stile"}, {"end": 36.040000915527344, "start": 35.65999984741211, "word": "di"}, {"end": 36.08000183105469, "start": 36.040000915527344, "word": "vita"}, {"end": 36.380001068115234, "start": 36.08000183105469, "word": "per"}, {"end": 36.70000076293945, "start": 36.380001068115234, "word": "molti"}]
          // console.log('filteredWords: ', filteredWords)
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
  console.log('wordTimeStamps: ', wordTimeStamps)
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
      const word = cleanWord(_word)
      const timeStamp = wordTimeStamps[timeStampsIndex];
      const timeStampWord = cleanWord(timeStamp.word)

      const lastTimeStampWord = timeStampsIndex < wordTimeStamps.length - 1
      const nextTimeStampWord = lastTimeStampWord ?
        cleanWord(wordTimeStamps[timeStampsIndex + 1].word)
      : null
      const nextWord = lastTimeStampWord ?
        cleanWord(words[paragraphIndex + 1])
      : null

      if (timeStampWord === word || nextTimeStampWord === nextWord) {
        paragraphWords.push({
          word,
          start: timeStamp.start,
          end: timeStamp.end,
        });
        timeStampsIndex++
      } else if (timeStamp.word.length < word.length) {
        let buildTimeStampWord = timeStampWord
        let buildTimeStampIndex = timeStampsIndex + 1
        let end = timeStamp.end;
        while (buildTimeStampWord !== word && buildTimeStampIndex < wordTimeStamps.length) {
          const nextTimeStampWord = cleanWord(wordTimeStamps[buildTimeStampIndex].word)
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

function cleanWord(word: string) {
  return cleanPunctuation(word).toLowerCase()
}
