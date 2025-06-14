import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAuth, useUser } from '@clerk/clerk-expo';

export default function HomeScreen() {
  const { signOut } = useAuth();
  const { user } = useUser();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
      Alert.alert('エラー', 'ログアウトに失敗しました。再度お試しください。');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>
        ようこそ、{user?.primaryEmailAddress?.emailAddress ?? 'ユーザー'}さん
      </Text>
      <Text style={styles.subtitle}>
        あなたの心の相談相手がここにいます
      </Text>
      
      <TouchableOpacity style={styles.chatButton}>
        <Text style={styles.chatButtonText}>相談を始める</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutButtonText}>ログアウト</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcome: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 40,
  },
  chatButton: {
    backgroundColor: '#3498db',
    borderRadius: 12,
    padding: 16,
    minWidth: 200,
    alignItems: 'center',
    marginBottom: 20,
  },
  chatButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  signOutButton: {
    borderWidth: 1,
    borderColor: '#e74c3c',
    borderRadius: 12,
    padding: 16,
    minWidth: 200,
    alignItems: 'center',
  },
  signOutButtonText: {
    color: '#e74c3c',
    fontSize: 16,
    fontWeight: '600',
  },
});