// ffmpeg-kit-react-native.d.ts
declare module 'ffmpeg-kit-react-native' {
  export class FFmpegKit {
    static execute(command: string): Promise<{ returnCode: number }>;
  }
}
