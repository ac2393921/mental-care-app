/**
 * 音声認識サービス
 * 現在はモック実装、将来的に外部音声認識APIと統合予定
 */

import { Audio } from 'expo-av';

export interface SpeechRecognitionResult {
  text: string;
  confidence: number;
}

export interface SpeechRecognitionError {
  message: string;
  code: 'PERMISSION_DENIED' | 'NETWORK_ERROR' | 'NO_SPEECH' | 'UNKNOWN';
}

export class SpeechRecognitionService {
  /**
   * 音声ファイルをテキストに変換
   * 現在はモック実装、将来的に音声認識APIと統合
   */
  static async recognizeSpeech(audioUri: string): Promise<SpeechRecognitionResult> {
    try {
      // 入力検証
      if (!audioUri || audioUri.trim() === '') {
        throw new Error('Invalid audio URI');
      }
      
      // 実際の実装では、ここで音声認識APIを呼び出す
      // 例: Google Cloud Speech-to-Text, AWS Transcribe, Azure Speech Services等
      
      // モック実装: 短い遅延の後にサンプルテキストを返す
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 実際の音声認識結果をシミュレート
      const mockResults = [
        '今日は調子が悪くて気分が沈んでいます',
        '仕事でストレスを感じています',
        '最近よく眠れなくて困っています',
        '友人との関係で悩んでいます',
        'ありがとうございます、少し楽になりました'
      ];
      
      const randomText = mockResults[Math.floor(Math.random() * mockResults.length)];
      
      return {
        text: randomText,
        confidence: 0.85 + Math.random() * 0.1 // 0.85-0.95の信頼度
      };
      
    } catch (error) {
      console.error('音声認識エラー:', error);
      throw {
        message: '音声認識に失敗しました',
        code: 'UNKNOWN'
      } as SpeechRecognitionError;
    }
  }

  /**
   * 音声認識が利用可能かチェック
   */
  static async isAvailable(): Promise<boolean> {
    try {
      const permission = await Audio.getPermissionsAsync();
      return permission.status === 'granted';
    } catch {
      return false;
    }
  }

  /**
   * サポートされている言語の取得
   */
  static getSupportedLanguages(): string[] {
    return ['ja-JP', 'en-US'];
  }
}

/**
 * 音声認識設定
 */
export interface SpeechRecognitionConfig {
  language: string;
  maxDuration: number; // 秒
  enablePunctuation: boolean;
}

export const DEFAULT_SPEECH_CONFIG: SpeechRecognitionConfig = {
  language: 'ja-JP',
  maxDuration: 60,
  enablePunctuation: true,
};