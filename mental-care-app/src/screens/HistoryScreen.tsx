import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList } from 'react-native';

const demoConversations = [
  {
    id: '1',
    title: '仕事でのストレスについて',
    lastMessage: 'あなたは十分頑張っていると思います。',
    updatedAt: '2024-06-11T10:30:00Z',
  },
  {
    id: '2',
    title: '人間関係の悩み',
    lastMessage: 'そんな風に感じるのも当然だと思います。',
    updatedAt: '2024-06-10T15:20:00Z',
  },
  {
    id: '3',
    title: '将来への不安',
    lastMessage: 'あなたのせいではありませんよ。',
    updatedAt: '2024-06-09T20:15:00Z',
  },
];

export default function HistoryScreen() {
  const renderConversation = ({ item }: { item: typeof demoConversations[0] }) => (
    <TouchableOpacity style={styles.conversationItem}>
      <View style={styles.conversationContent}>
        <Text style={styles.conversationTitle}>{item.title}</Text>
        <Text style={styles.lastMessage}>{item.lastMessage}</Text>
        <Text style={styles.timestamp}>
          {new Date(item.updatedAt).toLocaleDateString('ja-JP', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>相談履歴</Text>
        <Text style={styles.headerSubtitle}>過去の会話を振り返れます</Text>
      </View>

      <FlatList
        data={demoConversations}
        renderItem={renderConversation}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#9b59b6',
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
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  conversationItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  conversationContent: {
    flex: 1,
  },
  conversationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  lastMessage: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  timestamp: {
    fontSize: 12,
    color: '#95a5a6',
    alignSelf: 'flex-end',
  },
});