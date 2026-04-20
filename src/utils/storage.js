import AsyncStorage from '@react-native-async-storage/async-storage';

const PETS_KEY = '@petbook:pets';
const RECORDS_KEY_PREFIX = '@petbook:records:';
const CURRENT_PET_KEY = '@petbook:currentPet';

// ─── Pets ───────────────────────────────────────────────────────────────────

export async function getPets() {
  try {
    const raw = await AsyncStorage.getItem(PETS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function savePets(pets) {
  await AsyncStorage.setItem(PETS_KEY, JSON.stringify(pets));
}

export async function addPet(petData) {
  const pets = await getPets();
  const newPet = {
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    ...petData,
  };
  pets.push(newPet);
  await savePets(pets);
  return newPet;
}

export async function deletePet(petId) {
  const pets = await getPets();
  const updated = pets.filter((p) => p.id !== petId);
  await savePets(updated);
  // Also delete all records for this pet
  await AsyncStorage.removeItem(RECORDS_KEY_PREFIX + petId);
}

export async function getCurrentPetId() {
  try {
    return await AsyncStorage.getItem(CURRENT_PET_KEY);
  } catch {
    return null;
  }
}

export async function setCurrentPetId(petId) {
  await AsyncStorage.setItem(CURRENT_PET_KEY, petId);
}

// ─── Records ─────────────────────────────────────────────────────────────────

export async function getRecords(petId) {
  try {
    const raw = await AsyncStorage.getItem(RECORDS_KEY_PREFIX + petId);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveRecords(petId, records) {
  await AsyncStorage.setItem(RECORDS_KEY_PREFIX + petId, JSON.stringify(records));
}

export async function addRecord(petId, recordData) {
  const records = await getRecords(petId);
  const newRecord = {
    id: Date.now().toString(),
    petId,
    createdAt: new Date().toISOString(),
    ...recordData,
  };
  records.unshift(newRecord); // newest first
  await saveRecords(petId, records);
  return newRecord;
}

export async function deleteRecord(petId, recordId) {
  const records = await getRecords(petId);
  const updated = records.filter((r) => r.id !== recordId);
  await saveRecords(petId, updated);
}

// ─── Upcoming reminders across all pets ─────────────────────────────────────

export async function getAllUpcomingReminders(dayRange = 7) {
  const pets = await getPets();
  const now = new Date();
  const cutoff = new Date(now.getTime() + dayRange * 24 * 60 * 60 * 1000);
  const results = [];

  for (const pet of pets) {
    const records = await getRecords(pet.id);
    for (const rec of records) {
      if (rec.nextReminderDate) {
        const d = new Date(rec.nextReminderDate);
        if (d >= now && d <= cutoff) {
          results.push({ pet, record: rec });
        }
      }
    }
  }

  results.sort((a, b) => new Date(a.record.nextReminderDate) - new Date(b.record.nextReminderDate));
  return results;
}
