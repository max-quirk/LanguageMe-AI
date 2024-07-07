import { FFmpegKit } from "ffmpeg-kit-react-native";
import { ReadingWithWordTimeStamps, WordSegment } from "../services/whisper";
import { cleanPunctuation, filterBlankWords, hasTrailingPunctuation } from "./readings";

export function processWordTimeStamps({
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

export function wordTimeStampsReasonable({
  readingTimeStamps,
  audioDuration
}: {
  readingTimeStamps: ReadingWithWordTimeStamps,
  audioDuration: number
}): boolean {
  // Get the last word of the last paragraph
  const lastParagraph = readingTimeStamps.paragraphs[readingTimeStamps.paragraphs.length - 1];
  const lastWord = lastParagraph.words[lastParagraph.words.length - 1];

  // Check if the last word is within 2 seconds of the audio length
  if (audioDuration - lastWord.end > 3) {
    console.log('unreasonable: duration length')
    return false;
  }

  // Check that there are no jumps of more than 5 seconds between words
  for (const paragraph of readingTimeStamps.paragraphs) {
    for (let i = 1; i < paragraph.words.length; i++) {
      if (paragraph.words[i].start - paragraph.words[i - 1].start > 5) {
        console.log('unreasonable: gap')
        return false;
      }
    }
  }

  return true;
}


export function approximateTimeStamps({
  passage,
  audioDuration
}: {
  passage: string,
  audioDuration: number
}): ReadingWithWordTimeStamps {
  console.log('audioDuration: ', audioDuration)
  console.log('passage: ', passage)
  const paragraphs = passage.split('\n').map(paragraph => paragraph.trim()).filter(paragraph => paragraph !== '');

  // Calculate total characters including punctuation pauses
  const punctuationPauseFactor = 2;
  const totalCharactersAndPuncNum = paragraphs.reduce((count, paragraph) => 
    count + paragraph.split(' ').filter(filterBlankWords).reduce((characterCount, word) => 
      characterCount + cleanWord(word).length + (hasTrailingPunctuation(word) ? punctuationPauseFactor : 0), 0
    ), 0
  );

  const result: ReadingWithWordTimeStamps = { paragraphs: [] };
  let currentTime = 0;

  paragraphs.forEach(paragraph => {
    const words = paragraph.split(' ').filter(filterBlankWords);
    const paragraphWords: WordSegment[] = [];

    words.forEach((word) => {
      const punctuationPause = hasTrailingPunctuation(word) ? punctuationPauseFactor : 0;

      const cleanedWord = cleanWord(word);
      const wordLength = punctuationPause + cleanedWord.length;

      const wordLengthProportion = wordLength / totalCharactersAndPuncNum;

      const wordDuration = wordLengthProportion * audioDuration;

      paragraphWords.push({
        word: cleanedWord,
        start: currentTime,
        end: currentTime + wordDuration,
      });

      currentTime += wordDuration;
    });

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


export async function getAudioFileDuration(filePath: string, fileUri: string): Promise<number> {
  const durationSession = await FFmpegKit.execute(`-y -i ${filePath} -ar 16000 -ac 1 -c:a pcm_s16le ${fileUri}`) as { returnCode: number; getOutput: () => string }

  const durationOutput: string = durationSession.getOutput();
  const durationString = durationOutput.match(/Duration: (\d{2}:\d{2}:\d{2}.\d{2})/)?.[1]
  if (durationString) {
    return durationToSeconds(durationString)
  }
  return 0
}

// e.g. converts 00:01:31.94 to 91.94
function durationToSeconds(duration: string) {
  const [hours, minutes, seconds] = duration.split(':').map(parseFloat);
  return (hours * 3600) + (minutes * 60) + seconds;
}
