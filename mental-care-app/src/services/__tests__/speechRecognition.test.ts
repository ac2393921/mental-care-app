import { SpeechRecognitionService, DEFAULT_SPEECH_CONFIG } from '../speechRecognition';

// Audio モックは test-setup.ts で設定済み

describe('SpeechRecognitionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('recognizeSpeech', () => {
    it('should recognize speech and return text with confidence', async () => {
      const mockAudioUri = 'file://test-audio.m4a';
      
      const result = await SpeechRecognitionService.recognizeSpeech(mockAudioUri);
      
      expect(result).toHaveProperty('text');
      expect(result).toHaveProperty('confidence');
      expect(typeof result.text).toBe('string');
      expect(result.text.length).toBeGreaterThan(0);
      expect(result.confidence).toBeGreaterThanOrEqual(0.85);
      expect(result.confidence).toBeLessThanOrEqual(0.95);
    });

    it('should handle recognition errors', async () => {
      const invalidUri = '';
      
      await expect(
        SpeechRecognitionService.recognizeSpeech(invalidUri)
      ).rejects.toEqual({
        message: '音声認識に失敗しました',
        code: 'UNKNOWN'
      });
    });
  });

  describe('isAvailable', () => {
    it('should return availability status', async () => {
      const isAvailable = await SpeechRecognitionService.isAvailable();
      expect(typeof isAvailable).toBe('boolean');
    });
  });

  describe('getSupportedLanguages', () => {
    it('should return supported languages array', () => {
      const languages = SpeechRecognitionService.getSupportedLanguages();
      
      expect(Array.isArray(languages)).toBe(true);
      expect(languages).toContain('ja-JP');
      expect(languages).toContain('en-US');
    });
  });

  describe('DEFAULT_SPEECH_CONFIG', () => {
    it('should have correct default configuration', () => {
      expect(DEFAULT_SPEECH_CONFIG).toEqual({
        language: 'ja-JP',
        maxDuration: 60,
        enablePunctuation: true,
      });
    });
  });
});