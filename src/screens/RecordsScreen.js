import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Alert, SectionList,
} from 'react-native';
import { Colors, Fonts, Spacing, BorderRadius, Shadow } from '../utils/theme';
import { formatDate, RECORD_TYPES, getWeightTrend } from '../utils/helpers';
import AddRecordModal from '../components/AddRecordModal';

const TYPE_TABS = Object.entries(RECORD_TYPES).map(([value, cfg]) => ({ value, ...cfg }));

export default function RecordsScreen({ petBookData }) {
  const { currentPet, records, addRecord, deleteRecord } = petBookData;
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [activeType, setActiveType] = useState('all');

  const handleAddRecord = async (data) => {
    await addRecord(data);
    setShowAddRecord(false);
  };

  const handleDelete = (record) => {
    const cfg = RECORD_TYPES[record.type] || {};
    Alert.alert(
      '删除记录',
      `确定要删除这条${cfg.label || ''}记录吗？`,
      [
        { text: '取消', style: 'cancel' },
        { text: '删除', style: 'destructive', onPress: () => deleteRecord(record.id) },
      ]
    );
  };

  const filtered = activeType === 'all'
    ? records
    : records.filter((r) => r.type === activeType);

  // For weight type, show trend
  const weightRecords = records.filter((r) => r.type === 'weight').sort((a, b) => new Date(b.date) - new Date(a.date));
  const weightTrend = getWeightTrend(records);

  const renderRecord = (record) => {
    const cfg = RECORD_TYPES[record.type] || {};
    let main = '';
    let sub = '';
    if (record.type === 'vaccine') { main = record.vaccineName; sub = record.nextReminderDate ? `下次：${formatDate(record.nextReminderDate)}` : ''; }
    if (record.type === 'deworm') { main = record.dewormType; sub = record.nextReminderDate ? `下次：${formatDate(record.nextReminderDate)}` : ''; }
    if (record.type === 'weight') {
      main = `${record.weight} kg`;
      // Find trend for this record
      const idx = weightRecords.findIndex((r) => r.id === record.id);
      if (idx >= 0 && idx < weightRecords.length - 1) {
        const prev = weightRecords[idx + 1];
        const diff = record.weight - prev.weight;
        if (diff > 0) sub = `↑ +${diff.toFixed(1)} kg`;
        else if (diff < 0) sub = `↓ ${diff.toFixed(1)} kg`;
        else sub = '→ 体重未变';
      }
    }
    if (record.type === 'visit') { main = record.visitReason; sub = record.visitNote || ''; }
    if (record.type === 'daily') { main = record.dailyText; }

    return (
      <View key={record.id} style={[styles.recordCard, { borderLeftColor: cfg.color || Colors.primary }]}>
        <View style={styles.recordLeft}>
          <Text style={styles.recordEmoji}>{cfg.emoji || '📝'}</Text>
        </View>
        <View style={styles.recordBody}>
          <View style={styles.recordTopRow}>
            <Text style={styles.recordTypeBadge}>{cfg.label}</Text>
            <Text style={styles.recordDate}>{formatDate(record.date)}</Text>
          </View>
          <Text style={styles.recordMain} numberOfLines={2}>{main}</Text>
          {sub ? <Text style={styles.recordSub} numberOfLines={1}>{sub}</Text> : null}
        </View>
        <TouchableOpacity onPress={() => handleDelete(record)} style={styles.deleteBtn}>
          <Text style={styles.deleteText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (!currentPet) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🐾</Text>
          <Text style={styles.emptyTitle}>请先添加宠物</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{currentPet.avatar} {currentPet.name} 的健康档案</Text>
          <Text style={styles.subtitle}>共 {records.length} 条记录</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddRecord(true)}>
          <Text style={styles.addBtnText}>+ 添加</Text>
        </TouchableOpacity>
      </View>

      {/* Weight summary if in weight view */}
      {activeType === 'weight' && weightRecords.length > 0 && (
        <View style={styles.weightSummary}>
          <View style={styles.weightItem}>
            <Text style={styles.weightLabel}>最新体重</Text>
            <Text style={styles.weightValue}>{weightRecords[0].weight} kg</Text>
          </View>
          {weightTrend && (
            <View style={styles.weightItem}>
              <Text style={styles.weightLabel}>较上次</Text>
              <Text style={[styles.weightValue, { color: weightTrend.color }]}>
                {weightTrend.arrow} {weightTrend.diff} kg
              </Text>
            </View>
          )}
          <View style={styles.weightItem}>
            <Text style={styles.weightLabel}>记录次数</Text>
            <Text style={styles.weightValue}>{weightRecords.length} 次</Text>
          </View>
        </View>
      )}

      {/* Type filter tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsScroll}
        contentContainerStyle={styles.tabsContent}
      >
        <TouchableOpacity
          style={[styles.tab, activeType === 'all' && styles.tabActive]}
          onPress={() => setActiveType('all')}
        >
          <Text style={[styles.tabText, activeType === 'all' && styles.tabTextActive]}>全部</Text>
        </TouchableOpacity>
        {TYPE_TABS.map((t) => (
          <TouchableOpacity
            key={t.value}
            style={[styles.tab, activeType === t.value && { ...styles.tabActive, backgroundColor: t.color }]}
            onPress={() => setActiveType(t.value)}
          >
            <Text style={styles.tabEmoji}>{t.emoji}</Text>
            <Text style={[styles.tabText, activeType === t.value && styles.tabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Records list */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
        {filtered.length === 0 ? (
          <View style={styles.emptyRecords}>
            <Text style={styles.emptyRecordsEmoji}>
              {activeType !== 'all' ? RECORD_TYPES[activeType]?.emoji : '📋'}
            </Text>
            <Text style={styles.emptyRecordsText}>
              {activeType !== 'all'
                ? `还没有${RECORD_TYPES[activeType]?.label}记录`
                : '还没有任何记录'}
            </Text>
          </View>
        ) : (
          filtered.map(renderRecord)
        )}
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
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.sm,
  },
  title: { fontSize: 17, color: Colors.text, ...Fonts.bold },
  subtitle: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  addBtn: {
    backgroundColor: Colors.primary, borderRadius: BorderRadius.full,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  addBtnText: { fontSize: 13, color: Colors.white, ...Fonts.semiBold },

  weightSummary: {
    marginHorizontal: Spacing.lg, marginTop: Spacing.sm,
    backgroundColor: Colors.card, borderRadius: BorderRadius.lg,
    padding: Spacing.md, flexDirection: 'row', justifyContent: 'space-around',
    ...Shadow.small,
  },
  weightItem: { alignItems: 'center' },
  weightLabel: { fontSize: 11, color: Colors.textMuted, ...Fonts.medium },
  weightValue: { fontSize: 18, color: Colors.text, ...Fonts.bold, marginTop: 4 },

  tabsScroll: { maxHeight: 52 },
  tabsContent: { paddingHorizontal: Spacing.lg, paddingVertical: 8, gap: 8, alignItems: 'center' },
  tab: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 6,
    backgroundColor: Colors.card, borderRadius: BorderRadius.full,
    borderWidth: 1.5, borderColor: Colors.border,
  },
  tabActive: { borderColor: 'transparent', backgroundColor: Colors.primary },
  tabEmoji: { fontSize: 13 },
  tabText: { fontSize: 12, color: Colors.textLight, ...Fonts.medium },
  tabTextActive: { color: Colors.white, ...Fonts.semiBold },

  listContent: { padding: Spacing.lg, paddingTop: Spacing.sm },
  recordCard: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: Colors.card, borderRadius: BorderRadius.md,
    padding: Spacing.md, marginBottom: Spacing.sm,
    borderLeftWidth: 4, ...Shadow.small,
  },
  recordLeft: { marginRight: Spacing.sm },
  recordEmoji: { fontSize: 22 },
  recordBody: { flex: 1 },
  recordTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  recordTypeBadge: { fontSize: 11, color: Colors.textMuted, ...Fonts.medium },
  recordDate: { fontSize: 11, color: Colors.textMuted },
  recordMain: { fontSize: 15, color: Colors.text, ...Fonts.semiBold, marginTop: 4 },
  recordSub: { fontSize: 12, color: Colors.textLight, marginTop: 2 },
  deleteBtn: { padding: 4, marginLeft: 4 },
  deleteText: { fontSize: 16 },

  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyEmoji: { fontSize: 64 },
  emptyTitle: { fontSize: 18, color: Colors.text, ...Fonts.bold, marginTop: 16 },

  emptyRecords: { alignItems: 'center', paddingVertical: Spacing.xxl },
  emptyRecordsEmoji: { fontSize: 48 },
  emptyRecordsText: { fontSize: 14, color: Colors.textMuted, marginTop: 12 },
});
