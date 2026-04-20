import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Alert,
} from 'react-native';
import { Colors, Fonts, Spacing, BorderRadius, Shadow } from '../utils/theme';
import { formatDate, getPetAge, getSpeciesEmoji, PET_GENDERS } from '../utils/helpers';
import AddPetModal from '../components/AddPetModal';

export default function PetsScreen({ petBookData }) {
  const { pets, currentPet, switchPet, addPet, deletePet } = petBookData;
  const [showAddPet, setShowAddPet] = useState(false);

  const handleAddPet = async (petData) => {
    await addPet(petData);
    setShowAddPet(false);
  };

  const handleDeletePet = (pet) => {
    Alert.alert(
      `删除 ${pet.name}`,
      `确定要删除 ${pet.name} 的所有记录吗？此操作不可撤销 😢`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: () => deletePet(pet.id),
        },
      ]
    );
  };

  const getGenderLabel = (gender) => {
    const found = PET_GENDERS.find((g) => g.value === gender);
    return found ? `${found.emoji} ${found.label}` : '';
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🐾 我的宠物们</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddPet(true)}>
          <Text style={styles.addBtnText}>+ 新增</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
        {pets.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🐾</Text>
            <Text style={styles.emptyTitle}>还没有宠物</Text>
            <Text style={styles.emptyText}>点击右上角"+ 新增"按钮{'\n'}添加你的第一只宝贝！</Text>
            <TouchableOpacity style={styles.emptyAddBtn} onPress={() => setShowAddPet(true)}>
              <Text style={styles.emptyAddBtnText}>添加宠物</Text>
            </TouchableOpacity>
          </View>
        ) : (
          pets.map((pet) => {
            const isActive = pet.id === currentPet?.id;
            return (
              <TouchableOpacity
                key={pet.id}
                style={[styles.petCard, isActive && styles.petCardActive]}
                onPress={() => switchPet(pet.id)}
                activeOpacity={0.8}
              >
                {/* Active indicator */}
                {isActive && (
                  <View style={styles.activeBadge}>
                    <Text style={styles.activeBadgeText}>当前宠物</Text>
                  </View>
                )}

                <View style={styles.petCardInner}>
                  <View style={styles.avatarContainer}>
                    <Text style={styles.avatar}>{pet.avatar || getSpeciesEmoji(pet.species)}</Text>
                    {isActive && <View style={styles.activeRing} />}
                  </View>

                  <View style={styles.petInfo}>
                    <View style={styles.petNameRow}>
                      <Text style={styles.petName}>{pet.name}</Text>
                      <Text style={styles.petSpecies}>{getSpeciesEmoji(pet.species)}</Text>
                    </View>
                    {pet.breed ? <Text style={styles.petBreed}>{pet.breed}</Text> : null}

                    <View style={styles.tagRow}>
                      {pet.birthday && (
                        <View style={styles.tag}>
                          <Text style={styles.tagText}>🎂 {getPetAge(pet.birthday)}</Text>
                        </View>
                      )}
                      {pet.gender && pet.gender !== 'unknown' && (
                        <View style={styles.tag}>
                          <Text style={styles.tagText}>{getGenderLabel(pet.gender)}</Text>
                        </View>
                      )}
                      {pet.birthday && (
                        <View style={styles.tag}>
                          <Text style={styles.tagText}>📅 {formatDate(pet.birthday)}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>

                {/* Actions */}
                <View style={styles.actions}>
                  {!isActive && (
                    <TouchableOpacity style={styles.switchBtn} onPress={() => switchPet(pet.id)}>
                      <Text style={styles.switchBtnText}>切换</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeletePet(pet)}>
                    <Text style={styles.deleteBtnText}>删除</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })
        )}
        <View style={{ height: 20 }} />
      </ScrollView>

      <AddPetModal
        visible={showAddPet}
        onClose={() => setShowAddPet(false)}
        onAdd={handleAddPet}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.sm,
  },
  title: { fontSize: 22, color: Colors.text, ...Fonts.bold },
  addBtn: {
    backgroundColor: Colors.primary, borderRadius: BorderRadius.full,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  addBtnText: { fontSize: 13, color: Colors.white, ...Fonts.semiBold },

  listContent: { padding: Spacing.lg, paddingTop: Spacing.sm },

  petCard: {
    backgroundColor: Colors.card, borderRadius: BorderRadius.xl,
    padding: Spacing.lg, marginBottom: Spacing.md,
    borderWidth: 2, borderColor: 'transparent',
    ...Shadow.medium,
  },
  petCardActive: {
    borderColor: Colors.primary,
    backgroundColor: '#F0FAF4',
  },
  activeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 10, paddingVertical: 3,
    marginBottom: Spacing.sm,
  },
  activeBadgeText: { fontSize: 11, color: Colors.white, ...Fonts.semiBold },

  petCardInner: { flexDirection: 'row', alignItems: 'flex-start' },
  avatarContainer: { position: 'relative', marginRight: Spacing.md },
  avatar: { fontSize: 52 },
  activeRing: {
    position: 'absolute', bottom: -2, right: -2,
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: Colors.primary, borderWidth: 2, borderColor: Colors.white,
  },

  petInfo: { flex: 1 },
  petNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  petName: { fontSize: 20, color: Colors.text, ...Fonts.bold },
  petSpecies: { fontSize: 18 },
  petBreed: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  tag: {
    backgroundColor: Colors.background, borderRadius: BorderRadius.full,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  tagText: { fontSize: 11, color: Colors.textLight, ...Fonts.medium },

  actions: {
    flexDirection: 'row', justifyContent: 'flex-end', gap: Spacing.sm, marginTop: Spacing.md,
  },
  switchBtn: {
    backgroundColor: Colors.primary, borderRadius: BorderRadius.md,
    paddingHorizontal: 16, paddingVertical: 7,
  },
  switchBtnText: { fontSize: 13, color: Colors.white, ...Fonts.semiBold },
  deleteBtn: {
    backgroundColor: Colors.background, borderRadius: BorderRadius.md,
    paddingHorizontal: 16, paddingVertical: 7,
    borderWidth: 1, borderColor: Colors.danger,
  },
  deleteBtnText: { fontSize: 13, color: Colors.danger, ...Fonts.semiBold },

  emptyState: { alignItems: 'center', paddingTop: Spacing.xxl },
  emptyEmoji: { fontSize: 72 },
  emptyTitle: { fontSize: 22, color: Colors.text, ...Fonts.bold, marginTop: Spacing.md },
  emptyText: { fontSize: 14, color: Colors.textLight, marginTop: Spacing.sm, textAlign: 'center', lineHeight: 22 },
  emptyAddBtn: {
    marginTop: Spacing.lg, backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full, paddingHorizontal: 24, paddingVertical: 12,
    ...Shadow.small,
  },
  emptyAddBtnText: { fontSize: 15, color: Colors.white, ...Fonts.bold },
});
