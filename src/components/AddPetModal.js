import React, { useState } from 'react';
import {
  Modal, View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard,
} from 'react-native';
import { Colors, Fonts, Spacing, BorderRadius, Shadow } from '../utils/theme';
import { PET_SPECIES, PET_EMOJIS, PET_GENDERS } from '../utils/helpers';

export default function AddPetModal({ visible, onClose, onAdd }) {
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('cat');
  const [breed, setBreed] = useState('');
  const [birthday, setBirthday] = useState('');
  const [gender, setGender] = useState('unknown');
  const [selectedEmoji, setSelectedEmoji] = useState('🐱');
  const [errors, setErrors] = useState({});

  const reset = () => {
    setName(''); setSpecies('cat'); setBreed('');
    setBirthday(''); setGender('unknown'); setSelectedEmoji('🐱');
    setErrors({});
  };

  const handleClose = () => { reset(); onClose(); };

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = '请输入宠物名字';
    if (birthday && !/^\d{4}-\d{2}-\d{2}$/.test(birthday)) {
      e.birthday = '格式：YYYY-MM-DD，例如 2022-03-15';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onAdd({
      name: name.trim(),
      species,
      breed: breed.trim(),
      birthday: birthday || null,
      gender,
      avatar: selectedEmoji,
    });
    reset();
  };

  const handleSpeciesChange = (val) => {
    setSpecies(val);
    const found = PET_SPECIES.find((s) => s.value === val);
    if (found) setSelectedEmoji(found.emoji);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
            <View style={styles.sheet}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>新增宠物 🐾</Text>
                <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                  <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                {/* Emoji picker */}
                <Text style={styles.label}>头像</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.emojiRow}>
                  {PET_EMOJIS.map((e) => (
                    <TouchableOpacity
                      key={e}
                      style={[styles.emojiBtn, selectedEmoji === e && styles.emojiBtnActive]}
                      onPress={() => setSelectedEmoji(e)}
                    >
                      <Text style={styles.emojiText}>{e}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Name */}
                <Text style={styles.label}>名字 <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={[styles.input, errors.name && styles.inputError]}
                  value={name}
                  onChangeText={setName}
                  placeholder="宠物的名字"
                  placeholderTextColor={Colors.textMuted}
                  maxLength={20}
                />
                {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

                {/* Species */}
                <Text style={styles.label}>种类</Text>
                <View style={styles.optionRow}>
                  {PET_SPECIES.map((s) => (
                    <TouchableOpacity
                      key={s.value}
                      style={[styles.optionBtn, species === s.value && styles.optionBtnActive]}
                      onPress={() => handleSpeciesChange(s.value)}
                    >
                      <Text style={styles.optionEmoji}>{s.emoji}</Text>
                      <Text style={[styles.optionLabel, species === s.value && styles.optionLabelActive]}>
                        {s.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Breed */}
                <Text style={styles.label}>品种</Text>
                <TextInput
                  style={styles.input}
                  value={breed}
                  onChangeText={setBreed}
                  placeholder="品种（可选）"
                  placeholderTextColor={Colors.textMuted}
                  maxLength={30}
                />

                {/* Birthday */}
                <Text style={styles.label}>生日</Text>
                <TextInput
                  style={[styles.input, errors.birthday && styles.inputError]}
                  value={birthday}
                  onChangeText={setBirthday}
                  placeholder="YYYY-MM-DD，例如 2022-03-15"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="numbers-and-punctuation"
                  maxLength={10}
                />
                {errors.birthday && <Text style={styles.errorText}>{errors.birthday}</Text>}

                {/* Gender */}
                <Text style={styles.label}>性别</Text>
                <View style={styles.optionRow}>
                  {PET_GENDERS.map((g) => (
                    <TouchableOpacity
                      key={g.value}
                      style={[styles.optionBtn, gender === g.value && styles.optionBtnActive]}
                      onPress={() => setGender(g.value)}
                    >
                      <Text style={styles.optionEmoji}>{g.emoji}</Text>
                      <Text style={[styles.optionLabel, gender === g.value && styles.optionLabelActive]}>
                        {g.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Submit */}
                <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
                  <Text style={styles.submitText}>添加宝贝 {selectedEmoji}</Text>
                </TouchableOpacity>
                <View style={{ height: 20 }} />
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  keyboardView: { width: '100%' },
  sheet: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  title: { fontSize: 20, color: Colors.text, ...Fonts.bold },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.background,
    alignItems: 'center', justifyContent: 'center',
  },
  closeText: { fontSize: 14, color: Colors.textLight },
  label: {
    fontSize: 14, color: Colors.textLight, ...Fonts.semiBold,
    marginTop: Spacing.md, marginBottom: Spacing.xs,
  },
  required: { color: Colors.danger },
  emojiRow: { marginBottom: Spacing.xs },
  emojiBtn: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: Colors.background,
    alignItems: 'center', justifyContent: 'center',
    marginRight: Spacing.sm,
    borderWidth: 2, borderColor: 'transparent',
  },
  emojiBtnActive: { borderColor: Colors.primary, backgroundColor: '#E8F5EE' },
  emojiText: { fontSize: 24 },
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
  errorText: { fontSize: 12, color: Colors.danger, marginTop: 4 },
  optionRow: { flexDirection: 'row', gap: Spacing.sm },
  optionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, padding: Spacing.sm,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    borderWidth: 2, borderColor: 'transparent',
  },
  optionBtnActive: { borderColor: Colors.primary, backgroundColor: '#E8F5EE' },
  optionEmoji: { fontSize: 18 },
  optionLabel: { fontSize: 13, color: Colors.textLight, ...Fonts.medium },
  optionLabelActive: { color: Colors.accent, ...Fonts.semiBold },
  submitBtn: {
    marginTop: Spacing.lg,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    ...Shadow.small,
  },
  submitText: { fontSize: 16, color: Colors.white, ...Fonts.bold },
});
