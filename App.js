import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { usePetBook } from './src/hooks/usePetBook';
import AppNavigator from './src/navigation/AppNavigator';
import { configureNotifications } from './src/utils/notifications';
import { Colors } from './src/utils/theme';

configureNotifications();

export default function App() {
  const petBookData = usePetBook();

  if (petBookData.loading) {
    return (
      <View style={styles.loading}>
        <StatusBar style="dark" />
        <Text style={styles.loadingEmoji}>🐾</Text>
        <ActivityIndicator color={Colors.primary} size="large" style={{ marginTop: 16 }} />
        <Text style={styles.loadingText}>PetBook 加载中...</Text>
        <Text style={styles.loadingSubtext}>准备好为你的宝贝服务啦 💚</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <AppNavigator petBookData={petBookData} />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingEmoji: {
    fontSize: 72,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 18,
    color: Colors.text,
    fontWeight: '600',
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 13,
    color: Colors.textMuted,
  },
});
