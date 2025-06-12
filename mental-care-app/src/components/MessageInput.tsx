import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';

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

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      Alert.alert('エラー', 'メッセージを入力してください');
      return;
    }
    
    if (trimmedMessage.length > 1000) {
      Alert.alert('エラー', 'メッセージは1000文字以内で入力してください');
      return;
    }

    onSendMessage(trimmedMessage);
    setMessage('');
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
          maxLength={1000}
          editable={!loading}
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
      
      {/* 音声入力ボタン（後で実装） */}
      <TouchableOpacity style={styles.voiceButton}>
        <Text style={styles.voiceButtonText}>🎤</Text>
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
  voiceButtonText: {
    fontSize: 20,
  },
});