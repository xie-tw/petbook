/**
 * 跨平台日期选择器
 * Web: 原生 input[type=date]
 * Native: TextInput 手动输入
 */
import React from 'react';
import { Platform, View, TextInput, StyleSheet } from 'react-native';
import { Colors, Spacing, BorderRadius } from '../utils/theme';

export default function DatePicker({ value, onChange, placeholder, hasError }) {
  if (Platform.OS === 'web') {
    return (
      <input
        type="date"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        style={{
          backgroundColor: Colors.background,
          borderRadius: BorderRadius.md,
          padding: '12px',
          fontSize: '15px',
          color: value ? Colors.text : Colors.textMuted,
          border: `1px solid ${hasError ? Colors.danger : Colors.border}`,
          width: '100%',
          boxSizing: 'border-box',
          outline: 'none',
          fontFamily: 'inherit',
        }}
      />
    );
  }

  return (
    <TextInput
      style={[styles.input, hasError && styles.inputError]}
      value={value}
      onChangeText={onChange}
      placeholder={placeholder || 'YYYY-MM-DD'}
      placeholderTextColor={Colors.textMuted}
      keyboardType="numbers-and-punctuation"
      maxLength={10}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: 15,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputError: { borderColor: Colors.danger },
});
