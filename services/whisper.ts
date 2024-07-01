import RNFS from 'react-native-fs';
import { FFmpegKit } from 'ffmpeg-kit-react-native';

export interface WordSegment {
  start: number;
  end: number;
  text: string;
}

interface TranscriptionResponse {
  text: string;
  segments?: Array<{ start: number; end: number; text: string }>;
}

export const getWordTimeStamps = async (audioUrl: string): Promise<WordSegment[]> => {
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
          formData.append('response_format', "verbose_json");

          // Make the transcription request
          const transcriptionResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
              'Content-Type': 'multipart/form-data'
            },
            body: formData,
          });

          const data: TranscriptionResponse = await transcriptionResponse.json();

          if (data.segments && Array.isArray(data.segments)) {
            // Process segments to get word-level timestamps
            const wordSegments: WordSegment[] = [];
            data.segments.forEach(segment => {
              const words = segment.text.split(' ').filter(word => word.trim() !== '');
              const segmentDuration = segment.end - segment.start;
              const wordDuration = segmentDuration / words.length;

              words.forEach((word, index) => {
                wordSegments.push({
                  text: word,
                  start: segment.start + index * wordDuration,
                  end: segment.start + (index + 1) * wordDuration,
                });
              });
            });

            resolve(wordSegments);
          } else {
            reject(new Error('Invalid transcription response format'));
          }
        } catch (innerError) {
          console.error('Error processing file for transcription:', innerError);
          reject(innerError);
        }
      };
    });
  } catch (error) {
    console.error('Error during transcription:', error);
    throw error;
  }
};
