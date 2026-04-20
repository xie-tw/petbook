import { format, differenceInDays, differenceInYears, differenceInMonths, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    return format(parseISO(dateStr), 'yyyy年M月d日');
  } catch {
    return dateStr;
  }
}

export function formatDateShort(dateStr) {
  if (!dateStr) return '';
  try {
    return format(parseISO(dateStr), 'M月d日');
  } catch {
    return dateStr;
  }
}

export function getPetAge(birthday) {
  if (!birthday) return '';
  try {
    const birth = parseISO(birthday);
    const now = new Date();
    const years = differenceInYears(now, birth);
    const months = differenceInMonths(now, birth) % 12;
    if (years > 0) {
      return months > 0 ? `${years}岁${months}个月` : `${years}岁`;
    }
    if (months > 0) return `${months}个月`;
    const days = differenceInDays(now, birth);
    return `${days}天`;
  } catch {
    return '';
  }
}

export function getDaysUntil(dateStr) {
  if (!dateStr) return null;
  try {
    const target = parseISO(dateStr);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);
    return differenceInDays(target, now);
  } catch {
    return null;
  }
}

export const RECORD_TYPES = {
  vaccine: { label: '疫苗接种', emoji: '💉', color: '#B5D5F5', bgColor: '#EBF5FF' },
  deworm:  { label: '驱虫',     emoji: '🪱', color: '#D5B5F5', bgColor: '#F5EBFF' },
  weight:  { label: '体重记录', emoji: '⚖️', color: '#B5F5D5', bgColor: '#EBFFF5' },
  visit:   { label: '就诊记录', emoji: '🏥', color: '#F5D5B5', bgColor: '#FFF5EB' },
  daily:   { label: '日常记录', emoji: '📝', color: '#F5F0B5', bgColor: '#FFFCEB' },
};

export const PET_SPECIES = [
  { value: 'cat',   label: '猫咪', emoji: '🐱' },
  { value: 'dog',   label: '狗狗', emoji: '🐶' },
  { value: 'other', label: '其他', emoji: '🐾' },
];

export const PET_EMOJIS = ['🐱', '🐶', '🐰', '🐹', '🐸', '🐦', '🐠', '🦜', '🐢', '🦊'];

export const PET_GENDERS = [
  { value: 'male',    label: '男生', emoji: '♂️' },
  { value: 'female',  label: '女生', emoji: '♀️' },
  { value: 'unknown', label: '保密', emoji: '❓' },
];

export function getSpeciesEmoji(species) {
  const found = PET_SPECIES.find((s) => s.value === species);
  return found ? found.emoji : '🐾';
}

export function getWeightTrend(records) {
  const weightRecords = records
    .filter((r) => r.type === 'weight' && r.weight)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  if (weightRecords.length < 2) return null;
  const last = weightRecords[weightRecords.length - 1].weight;
  const prev = weightRecords[weightRecords.length - 2].weight;
  const diff = last - prev;
  if (diff > 0) return { arrow: '↑', diff: `+${diff.toFixed(1)}`, color: '#E07070' };
  if (diff < 0) return { arrow: '↓', diff: `${diff.toFixed(1)}`, color: '#52B788' };
  return { arrow: '→', diff: '0.0', color: '#9DBFAF' };
}
