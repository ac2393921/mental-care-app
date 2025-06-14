import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import { Audio } from 'expo-av';
import { SpeechRecognitionService } from '../services/speechRecognition';

const MAX_MESSAGE_LENGTH = 1000;

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  loading?: boolean;
  placeholder?: string;
}

export default function MessageInput({ 
  onSendMessage, 
  loading = false,
  placeholder = "メッセージを入力..."
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      Alert.alert('エラー', 'メッセージを入力してください');
      return;
    }
    
    if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
      Alert.alert('エラー', `メッセージは${MAX_MESSAGE_LENGTH}文字以内で入力してください`);
      return;
    }

    onSendMessage(trimmedMessage);
    setMessage('');
  };

  const startRecording = async () => {
    try {
      // マイクロフォン権限のリクエスト
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('権限が必要です', 'マイクロフォンへのアクセス権限が必要です。');
        return;
      }

      // 音声設定
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // 録音開始
      const recordingInstance = new Audio.Recording();
      await recordingInstance.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      await recordingInstance.startAsync();
      
      setRecording(recordingInstance);
      setIsRecording(true);
    } catch (error) {
      console.error('録音開始エラー:', error);
      Alert.alert('エラー', '録音を開始できませんでした。');
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;

      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      
      const uri = recording.getURI();
      setRecording(null);
      
      if (uri) {
        // 音声をテキストに変換
        try {
          const result = await SpeechRecognitionService.recognizeSpeech(uri);
          if (result.text) {
            setMessage(result.text);
            Alert.alert(
              '音声認識完了', 
              `認識されたテキスト: "${result.text}"\n信頼度: ${Math.round(result.confidence * 100)}%`
            );
          }
        } catch (error) {
          console.error('音声認識エラー:', error);
          Alert.alert('音声認識エラー', '音声をテキストに変換できませんでした。もう一度お試しください。');
        }
      }
    } catch (error) {
      console.error('録音停止エラー:', error);
      Alert.alert('エラー', '録音を停止できませんでした。');
    }
  };

  const handleVoiceInput = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={message}
          onChangeText={setMessage}
          placeholder={placeholder}
          placeholderTextColor="#95a5a6"
          multiline
          maxLength={MAX_MESSAGE_LENGTH}
          editable={!loading}
          accessibilityLabel="メッセージ入力"
          returnKeyType="send"
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!message.trim() || loading) && styles.sendButtonDisabled
          ]}
          onPress={handleSend}
          disabled={!message.trim() || loading}
        >
          <Text style={[
            styles.sendButtonText,
            (!message.trim() || loading) && styles.sendButtonTextDisabled
          ]}>
            {loading ? '送信中...' : '送信'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* 音声入力ボタン */}
      <TouchableOpacity 
        style={[
          styles.voiceButton,
          isRecording && styles.voiceButtonRecording
        ]}
        onPress={handleVoiceInput}
        disabled={loading}
        accessibilityLabel={isRecording ? '録音停止' : '音声入力開始'}
      >
        <Text style={styles.voiceButtonText}>
          {isRecording ? '⏹️' : '🎤'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#f8f9fa',
    alignItems: 'flex-end',
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e1e8ed',
    marginRight: 8,
    paddingHorizontal: 4,
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    color: '#2c3e50',
  },
  sendButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#3498db',
    borderRadius: 16,
    margin: 4,
  },
  sendButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  sendButtonTextDisabled: {
    color: '#ecf0f1',
  },
  voiceButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#27ae60',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  voiceButtonRecording: {
    backgroundColor: '#e74c3c',
  },
  voiceButtonText: {
    fontSize: 20,
  },
});