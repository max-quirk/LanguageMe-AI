declare module 'ffmpeg-kit-react-native' {
  export class FFmpegKit {
    static execute(command: string): Promise<{ returnCode: number }>;
  }

  export class FFprobeKit {
    static execute(command: string): Promise<{ returnCode: number }>;
    static getMediaInformation(filePath: string): Promise<MediaInformationSession>;
  }

  export class MediaInformation {
    getDuration(): string | undefined;
  }

  export class MediaInformationSession {
    getMediaInformation(): MediaInformation | undefined;
    getFailStackTrace(): string | undefined;
  }
}
