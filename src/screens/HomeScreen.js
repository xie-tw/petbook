import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, SafeAreaView,
} from 'react-native';
import { Colors, Fonts, Spacing, BorderRadius, Shadow } from '../utils/theme';
import {
  formatDate, formatDateShort, getPetAge, getDaysUntil,
  RECORD_TYPES, getSpeciesEmoji, getWeightTrend,
} from '../utils/helpers';
import AddRecordModal from '../components/AddRecordModal';

export default function HomeScreen({ petBookData }) {
  const { currentPet, records, upcomingReminders, addRecord, refresh } = petBookData;
  const [refreshing, setRefreshing] = useState(false);
  const [showAddRecord, setShowAddRecord] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const recentRecords = records.slice(0, 5);
  const weightRecords = records.filter((r) => r.type === 'weight');
  const weightTrend = getWeightTrend(records);
  const latestWeight = weightRecords[0];

  const handleAddRecord = async (data) => {
    await addRecord(data);
    setShowAddRecord(false);
  };

  if (!currentPet) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🐾</Text>
          <Text style={styles.emptyTitle}>还没有宠物</Text>
          <Text style={styles.emptyText}>去"宠物"页面添加你的第一只宝贝吧！</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* Header */}
        <View style={styles.pageHeader}>
          <View>
            <Text style={styles.greeting}>你好呀 👋</Text>
            <Text style={styles.subtitle}>来看看 {currentPet.name} 的状态</Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddRecord(true)}>
            <Text style={styles.addBtnText}>+ 添加记录</Text>
          </TouchableOpacity>
        </View>

        {/* Pet Card */}
        <View style={styles.petCard}>
          <View style={styles.petCardLeft}>
            <Text style={styles.petAvatar}>{currentPet.avatar || getSpeciesEmoji(currentPet.species)}</Text>
          </View>
          <View style={styles.petCardRight}>
            <View style={styles.petNameRow}>
              <Text style={styles.petName}>{currentPet.name}</Text>
              <Text style={styles.petSpecies}>{getSpeciesEmoji(currentPet.species)}</Text>
            </View>
            {currentPet.breed ? <Text style={styles.petBreed}>{currentPet.breed}</Text> : null}
            <View style={styles.petMeta}>
              {currentPet.birthday && (
                <View style={styles.metaTag}>
                  <Text style={styles.metaText}>🎂 {getPetAge(currentPet.birthday)}</Text>
                </View>
              )}
              {latestWeight && (
                <View style={styles.metaTag}>
                  <Text style={styles.metaText}>
                    ⚖️ {latestWeight.weight}kg{' '}
                    {weightTrend && <Text style={{ color: weightTrend.color }}>{weightTrend.arrow}</Text>}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Upcoming Reminders */}
        {upcomingReminders.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⏰ 即将到来的提醒</Text>
            {upcomingReminders.map(({ pet, record }) => {
              const days = getDaysUntil(record.nextReminderDate);
              const cfg = RECORD_TYPES[record.type] || {};
              return (
                <View key={record.id} style={[styles.reminderCard, { borderLeftColor: cfg.color || Colors.primary }]}>
                  <Text style={styles.reminderEmoji}>{cfg.emoji || '🔔'}</Text>
                  <View style={styles.reminderInfo}>
                    <Text style={styles.reminderPet}>{pet.avatar} {pet.name}</Text>
                    <Text style={styles.reminderTitle}>
                      {cfg.label}{record.vaccineName ? `：${record.vaccineName}` : ''}
                      {record.dewormType ? `：${record.dewormType}` : ''}
                    </Text>
                    <Text style={styles.reminderDate}>{formatDateShort(record.nextReminderDate)}</Text>
                  </View>
                  <View style={[styles.daysBadge, days === 0 && styles.daysBadgeToday]}>
                    <Text style={[styles.daysNum, days === 0 && styles.daysNumToday]}>
                      {days === 0 ? '今天' : `${days}天`}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Recent Records */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 最近记录</Text>
          {recentRecords.length === 0 ? (
            <View style={styles.emptyRecords}>
              <Text style={styles.emptyRecordsText}>还没有记录，快给宝贝记一笔吧～</Text>
            </View>
          ) : (
            recentRecords.map((record) => {
              const cfg = RECORD_TYPES[record.type] || {};
              let summary = '';
              if (record.type === 'vaccine') summary = record.vaccineName;
              else if (record.type === 'deworm') summary = record.dewormType;
              else if (record.type === 'weight') summary = `${record.weight} kg`;
              else if (record.type === 'visit') summary = record.visitReason;
              else if (record.type === 'daily') summary = record.dailyText;

              return (
                <View key={record.id} style={[styles.recordItem, { backgroundColor: cfg.bgColor || Colors.background }]}>
                  <Text style={styles.recordEmoji}>{cfg.emoji || '📝'}</Text>
                  <View style={styles.recordInfo}>
                    <Text style={styles.recordType}>{cfg.label}</Text>
                    <Text style={styles.recordSummary} numberOfLines={1}>{summary}</Text>
                  </View>
                  <Text style={styles.recordDate}>{formatDateShort(record.date)}</Text>
                </View>
              );
            })
          )}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      <AddRecordModal
        visible={showAddRecord}
        onClose={() => setShowAddRecord(false)}
        onAdd={handleAddRecord}
        petName={currentPet?.name}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  pageHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.sm,
  },
  greeting: { fontSize: 22, color: Colors.text, ...Fonts.bold },
  subtitle: { fontSize: 14, color: Colors.textLight, marginTop: 2 },
  addBtn: {
    backgroundColor: Colors.primary, borderRadius: BorderRadius.full,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  addBtnText: { fontSize: 13, color: Colors.white, ...Fonts.semiBold },

  petCard: {
    marginHorizontal: Spacing.lg, marginTop: Spacing.sm,
    backgroundColor: Colors.card, borderRadius: BorderRadius.xl,
    padding: Spacing.lg, flexDirection: 'row', alignItems: 'center',
    ...Shadow.medium,
  },
  petCardLeft: { marginRight: Spacing.md },
  petAvatar: { fontSize: 52 },
  petCardRight: { flex: 1 },
  petNameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  petName: { fontSize: 22, color: Colors.text, ...Fonts.bold },
  petSpecies: { fontSize: 20 },
  petBreed: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
  petMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  metaTag: {
    backgroundColor: Colors.background, borderRadius: BorderRadius.full,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  metaText: { fontSize: 12, color: Colors.textLight, ...Fonts.medium },

  section: { marginTop: Spacing.lg, paddingHorizontal: Spacing.lg },
  sectionTitle: { fontSize: 16, color: Colors.text, ...Fonts.bold, marginBottom: Spacing.sm },

  reminderCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.card, borderRadius: BorderRadius.md,
    padding: Spacing.md, marginBottom: Spacing.sm,
    borderLeftWidth: 4,
    ...Shadow.small,
  },
  reminderEmoji: { fontSize: 24, marginRight: Spacing.sm },
  reminderInfo: { flex: 1 },
  reminderPet: { fontSize: 12, color: Colors.textMuted, ...Fonts.medium },
  reminderTitle: { fontSize: 14, color: Colors.text, ...Fonts.semiBold, marginTop: 2 },
  reminderDate: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  daysBadge: {
    backgroundColor: Colors.primary, borderRadius: BorderRadius.full,
    paddingHorizontal: 10, paddingVertical: 4, marginLeft: 8,
  },
  daysBadgeToday: { backgroundColor: Colors.danger },
  daysNum: { fontSize: 12, color: Colors.white, ...Fonts.bold },
  daysNumToday: { color: Colors.white },

  recordItem: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: BorderRadius.md, padding: Spacing.md, marginBottom: Spacing.sm,
  },
  recordEmoji: { fontSize: 22, marginRight: Spacing.sm },
  recordInfo: { flex: 1 },
  recordType: { fontSize: 12, color: Colors.textMuted, ...Fonts.medium },
  recordSummary: { fontSize: 14, color: Colors.text, ...Fonts.semiBold, marginTop: 2 },
  recordDate: { fontSize: 12, color: Colors.textMuted },

  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  emptyEmoji: { fontSize: 64 },
  emptyTitle: { fontSize: 20, color: Colors.text, ...Fonts.bold, marginTop: Spacing.md },
  emptyText: { fontSize: 14, color: Colors.textLight, marginTop: Spacing.sm, textAlign: 'center' },

  emptyRecords: {
    backgroundColor: Colors.card, borderRadius: BorderRadius.md,
    padding: Spacing.lg, alignItems: 'center',
  },
  emptyRecordsText: { fontSize: 14, color: Colors.textMuted },
});
