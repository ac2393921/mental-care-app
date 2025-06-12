import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import MessageBubble from '../components/MessageBubble';
import MessageInput from '../components/MessageInput';
import { Message, Conversation } from '../types';
import { useChatStore } from '../stores/chatStore';
import { useAuth } from '../hooks/useAuth';
import { ConversationService } from '../services/conversation';

export default function ChatScreen() {
  const { user } = useAuth();
  const { messages, isLoading, addMessage, setIsLoading, currentConversation, setCurrentConversation } = useChatStore();
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [conversationService] = useState(() => new ConversationService());
  const flatListRef = useRef<FlatList>(null);

  // 初期化処理
  useEffect(() => {
    if (user?.id && !currentConversation) {
      initializeChat();
    }
  }, [user]);

  const initializeChat = async () => {
    if (!user?.id) return;

    try {
      // 新しい会話を作成
      const conversation = await conversationService.createConversation(
        user.id,
        '新しい相談'
      );
      setCurrentConversation(conversation);

      // 歓迎メッセージを追加
      const welcomeMessage: Message = {
        id: `welcome-${Date.now()}`,
        conversation_id: conversation.id,
        content: 'こんにちは！今日はどんなことでお悩みですか？どんなことでも気軽にお話しください。あなたの気持ちを聞かせてくださいね。',
        role: 'assistant',
        created_at: new Date().toISOString(),
      };
      setLocalMessages([welcomeMessage]);
    } catch (error) {
      console.error('Error initializing chat:', error);
      Alert.alert('エラー', 'チャットの初期化に失敗しました');
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!user?.id || !currentConversation) return;

    try {
      // 利用制限をチェック
      const { canSend, reason } = await conversationService.canUserSendMessage(user.id);
      if (!canSend) {
        Alert.alert('利用制限', reason);
        return;
      }

      // ユーザーメッセージを表示に追加
      const tempUserMessage: Message = {
        id: `temp-user-${Date.now()}`,
        conversation_id: currentConversation.id,
        content,
        role: 'user',
        created_at: new Date().toISOString(),
      };
      setLocalMessages(prev => [...prev, tempUserMessage]);
      setIsLoading(true);

      // スクロールを最下部に
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);

      // メッセージを送信してLLMレスポンスを取得
      const { userMessage, assistantMessage } = await conversationService.sendMessage(
        currentConversation.id,
        content,
        user.id
      );

      // 一時的なユーザーメッセージをサーバーからのメッセージで置き換え
      setLocalMessages(prev => {
        const withoutTemp = prev.filter(msg => msg.id !== tempUserMessage.id);
        return [...withoutTemp, userMessage, assistantMessage];
      });

      // 最初のメッセージの場合、会話タイトルを更新
      if (localMessages.length === 1) { // welcome messageのみ
        const title = conversationService.generateConversationTitle(content);
        // タイトル更新の処理は後で実装
      }

    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('エラー', 'メッセージの送信に失敗しました');
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <MessageBubble message={item} />
  );

  const renderTypingIndicator = () => (
    <View style={styles.typingContainer}>
      <View style={styles.typingBubble}>
        <ActivityIndicator size="small" color="#95a5a6" />
        <Text style={styles.typingText}>相談相手が入力中...</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>心の相談相手</Text>
        <Text style={styles.headerSubtitle}>あなたの話を聞かせてください</Text>
      </View>

      <KeyboardAvoidingView 
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          style={styles.messageList}
          data={localMessages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messageListContent}
          ListFooterComponent={isLoading ? renderTypingIndicator : null}
        />

        <MessageInput
          onSendMessage={handleSendMessage}
          loading={isLoading}
          placeholder="どんなことでも気軽にお話しください..."
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#3498db',
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    paddingVertical: 16,
  },
  typingContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginVertical: 4,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e1e8ed',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  typingText: {
    fontSize: 14,
    color: '#95a5a6',
    marginLeft: 8,
    fontStyle: 'italic',
  },
});