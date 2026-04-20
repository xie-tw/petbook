import React, { useState } from 'react';
import {
  Modal, View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard,
} from 'react-native';
import { Colors, Fonts, Spacing, BorderRadius, Shadow } from '../utils/theme';
import { RECORD_TYPES } from '../utils/helpers';

const TYPE_OPTIONS = Object.entries(RECORD_TYPES).map(([value, cfg]) => ({ value, ...cfg }));

export default function AddRecordModal({ visible, onClose, onAdd, petName }) {
  const [type, setType] = useState('vaccine');
  const [date, setDate] = useState('');
  const [nextReminderDate, setNextReminderDate] = useState('');
  // vaccine fields
  const [vaccineName, setVaccineName] = useState('');
  // deworm fields
  const [dewormType, setDewormType] = useState('');
  // weight fields
  const [weight, setWeight] = useState('');
  // visit fields
  const [visitReason, setVisitReason] = useState('');
  const [visitNote, setVisitNote] = useState('');
  // daily fields
  const [dailyText, setDailyText] = useState('');

  const [errors, setErrors] = useState({});

  const todayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const reset = () => {
    setType('vaccine'); setDate(''); setNextReminderDate('');
    setVaccineName(''); setDewormType(''); setWeight('');
    setVisitReason(''); setVisitNote(''); setDailyText('');
    setErrors({});
  };

  const handleClose = () => { reset(); onClose(); };

  const isDateValid = (s) => !s || /^\d{4}-\d{2}-\d{2}$/.test(s);

  const validate = () => {
    const e = {};
    if (!date.trim()) e.date = '请输入日期';
    else if (!isDateValid(date)) e.date = '格式：YYYY-MM-DD';
    if (nextReminderDate && !isDateValid(nextReminderDate)) e.nextReminderDate = '格式：YYYY-MM-DD';
    if (type === 'vaccine' && !vaccineName.trim()) e.vaccineName = '请输入疫苗名称';
    if (type === 'deworm' && !dewormType.trim()) e.dewormType = '请输入驱虫类型';
    if (type === 'weight') {
      if (!weight.trim()) e.weight = '请输入体重';
      else if (isNaN(parseFloat(weight))) e.weight = '请输入有效数字';
    }
    if (type === 'visit' && !visitReason.trim()) e.visitReason = '请输入就诊原因';
    if (type === 'daily' && !dailyText.trim()) e.dailyText = '请输入内容';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const base = {
      type,
      date: date.trim(),
      nextReminderDate: nextReminderDate.trim() || null,
    };
    let extra = {};
    if (type === 'vaccine') extra = { vaccineName: vaccineName.trim() };
    if (type === 'deworm') extra = { dewormType: dewormType.trim() };
    if (type === 'weight') extra = { weight: parseFloat(weight) };
    if (type === 'visit') extra = { visitReason: visitReason.trim(), visitNote: visitNote.trim() };
    if (type === 'daily') extra = { dailyText: dailyText.trim() };
    onAdd({ ...base, ...extra });
    reset();
  };

  const showReminder = type === 'vaccine' || type === 'deworm';

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ width: '100%' }}>
            <View style={styles.sheet}>
              <View style={styles.header}>
                <Text style={styles.title}>添加记录 {petName ? `· ${petName}` : ''}</Text>
                <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                  <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                {/* Type selector */}
                <Text style={styles.label}>记录类型</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.sm }}>
                  {TYPE_OPTIONS.map((t) => (
                    <TouchableOpacity
                      key={t.value}
                      style={[styles.typeBtn, type === t.value && { backgroundColor: t.color, borderColor: t.color }]}
                      onPress={() => setType(t.value)}
                    >
                      <Text style={styles.typeEmoji}>{t.emoji}</Text>
                      <Text style={[styles.typeLabel, type === t.value && styles.typeLabelActive]}>{t.label}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Date */}
                <Text style={styles.label}>日期 <Text style={styles.required}>*</Text></Text>
                <View style={styles.dateRow}>
                  <TextInput
                    style={[styles.input, { flex: 1 }, errors.date && styles.inputError]}
                    value={date}
                    onChangeText={setDate}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="numbers-and-punctuation"
                    maxLength={10}
                  />
                  <TouchableOpacity style={styles.todayBtn} onPress={() => setDate(todayStr())}>
                    <Text style={styles.todayText}>今天</Text>
                  </TouchableOpacity>
                </View>
                {errors.date && <Text style={styles.errorText}>{errors.date}</Text>}

                {/* Type-specific fields */}
                {type === 'vaccine' && (
                  <>
                    <Text style={styles.label}>疫苗名称 <Text style={styles.required}>*</Text></Text>
                    <TextInput
                      style={[styles.input, errors.vaccineName && styles.inputError]}
                      value={vaccineName}
                      onChangeText={setVaccineName}
                      placeholder="例如：猫三联、狂犬疫苗"
                      placeholderTextColor={Colors.textMuted}
                    />
                    {errors.vaccineName && <Text style={styles.errorText}>{errors.vaccineName}</Text>}
                  </>
                )}

                {type === 'deworm' && (
                  <>
                    <Text style={styles.label}>驱虫类型 <Text style={styles.required}>*</Text></Text>
                    <TextInput
                      style={[styles.input, errors.dewormType && styles.inputError]}
                      value={dewormType}
                      onChangeText={setDewormType}
                      placeholder="例如：体外驱虫、体内驱虫"
                      placeholderTextColor={Colors.textMuted}
                    />
                    {errors.dewormType && <Text style={styles.errorText}>{errors.dewormType}</Text>}
                  </>
                )}

                {type === 'weight' && (
                  <>
                    <Text style={styles.label}>体重 (kg) <Text style={styles.required}>*</Text></Text>
                    <TextInput
                      style={[styles.input, errors.weight && styles.inputError]}
                      value={weight}
                      onChangeText={setWeight}
                      placeholder="例如：4.5"
                      placeholderTextColor={Colors.textMuted}
                      keyboardType="decimal-pad"
                    />
                    {errors.weight && <Text style={styles.errorText}>{errors.weight}</Text>}
                  </>
                )}

                {type === 'visit' && (
                  <>
                    <Text style={styles.label}>就诊原因 <Text style={styles.required}>*</Text></Text>
                    <TextInput
                      style={[styles.input, errors.visitReason && styles.inputError]}
                      value={visitReason}
                      onChangeText={setVisitReason}
                      placeholder="例如：年度体检、感冒发烧"
                      placeholderTextColor={Colors.textMuted}
                    />
                    {errors.visitReason && <Text style={styles.errorText}>{errors.visitReason}</Text>}
                    <Text style={styles.label}>备注</Text>
                    <TextInput
                      style={[styles.input, styles.multilineInput]}
                      value={visitNote}
                      onChangeText={setVisitNote}
                      placeholder="医生建议、用药情况等（可选）"
                      placeholderTextColor={Colors.textMuted}
                      multiline
                      numberOfLines={3}
                    />
                  </>
                )}

                {type === 'daily' && (
                  <>
                    <Text style={styles.label}>内容 <Text style={styles.required}>*</Text></Text>
                    <TextInput
                      style={[styles.input, styles.multilineInput, errors.dailyText && styles.inputError]}
                      value={dailyText}
                      onChangeText={setDailyText}
                      placeholder="记录今天发生的事情～"
                      placeholderTextColor={Colors.textMuted}
                      multiline
                      numberOfLines={4}
                    />
                    {errors.dailyText && <Text style={styles.errorText}>{errors.dailyText}</Text>}
                  </>
                )}

                {/* Reminder date (vaccine / deworm only) */}
                {showReminder && (
                  <>
                    <Text style={styles.label}>下次提醒日期</Text>
                    <TextInput
                      style={[styles.input, errors.nextReminderDate && styles.inputError]}
                      value={nextReminderDate}
                      onChangeText={setNextReminderDate}
                      placeholder="YYYY-MM-DD（将设置推送提醒）"
                      placeholderTextColor={Colors.textMuted}
                      keyboardType="numbers-and-punctuation"
                      maxLength={10}
                    />
                    {errors.nextReminderDate && <Text style={styles.errorText}>{errors.nextReminderDate}</Text>}
                    <Text style={styles.hint}>🔔 设置后，届时会收到可爱提醒哦！</Text>
                  </>
                )}

                <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
                  <Text style={styles.submitText}>保存记录 {RECORD_TYPES[type]?.emoji}</Text>
                </TouchableOpacity>
                <View style={{ height: 24 }} />
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: Colors.overlay, justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg,
    maxHeight: '92%',
  },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  title: { fontSize: 18, color: Colors.text, ...Fonts.bold },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center',
  },
  closeText: { fontSize: 14, color: Colors.textLight },
  label: {
    fontSize: 14, color: Colors.textLight, ...Fonts.semiBold,
    marginTop: Spacing.md, marginBottom: Spacing.xs,
  },
  required: { color: Colors.danger },
  typeBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8,
    backgroundColor: Colors.background, borderRadius: BorderRadius.full,
    marginRight: Spacing.sm, borderWidth: 2, borderColor: 'transparent',
  },
  typeEmoji: { fontSize: 16 },
  typeLabel: { fontSize: 13, color: Colors.textLight, ...Fonts.medium },
  typeLabelActive: { color: Colors.text, ...Fonts.semiBold },
  dateRow: { flexDirection: 'row', gap: Spacing.sm },
  todayBtn: {
    backgroundColor: Colors.primary, borderRadius: BorderRadius.md,
    paddingHorizontal: 14, justifyContent: 'center',
  },
  todayText: { fontSize: 13, color: Colors.white, ...Fonts.semiBold },
  input: {
    backgroundColor: Colors.background, borderRadius: BorderRadius.md,
    padding: Spacing.md, fontSize: 15, color: Colors.text,
    borderWidth: 1, borderColor: Colors.border,
  },
  inputError: { borderColor: Colors.danger },
  multilineInput: { minHeight: 80, textAlignVertical: 'top' },
  errorText: { fontSize: 12, color: Colors.danger, marginTop: 4 },
  hint: { fontSize: 12, color: Colors.textMuted, marginTop: 6 },
  submitBtn: {
    marginTop: Spacing.lg, backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg, padding: Spacing.md,
    alignItems: 'center', ...Shadow.small,
  },
  submitText: { fontSize: 16, color: Colors.white, ...Fonts.bold },
});
