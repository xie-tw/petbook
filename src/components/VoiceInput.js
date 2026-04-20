/**
 * 语音输入按钮（仅 Web，基于 Web Speech API）
 * 点击麦克风开始录音，说完自动转文字追加到输入框
 */
import React, { useState, useRef } from 'react';
import { Platform, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Colors, BorderRadius } from '../utils/theme';

export default function VoiceInput({ onResult, style }) {
  const [listening, setListening] = useState(false);
  const [supported] = useState(() => {
    if (Platform.OS !== 'web') return false;
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  });
  const recognitionRef = useRef(null);

  if (!supported) return null;

  const start = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    recognition.lang = 'zh-CN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      onResult(transcript);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stop = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  return (
    <TouchableOpacity
      style={[styles.btn, listening && styles.btnActive, style]}
      onPress={listening ? stop : start}
    >
      <Text style={styles.icon}>{listening ? '⏹' : '🎙️'}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  btnActive: {
    backgroundColor: '#FFE0E0',
    borderColor: Colors.danger,
  },
  icon: { fontSize: 20 },
});
