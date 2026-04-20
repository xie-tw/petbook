import { useState, useEffect, useCallback } from 'react';
import {
  getPets,
  addPet,
  deletePet,
  getRecords,
  addRecord,
  deleteRecord,
  getCurrentPetId,
  setCurrentPetId,
  getAllUpcomingReminders,
} from '../utils/storage';
import {
  requestNotificationPermission,
  scheduleReminderNotification,
  cancelNotification,
} from '../utils/notifications';

export function usePetBook() {
  const [pets, setPets] = useState([]);
  const [currentPetId, setCurrentPetIdState] = useState(null);
  const [records, setRecords] = useState([]);
  const [upcomingReminders, setUpcomingReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentPet = pets.find((p) => p.id === currentPetId) || pets[0] || null;

  // ─── Init ────────────────────────────────────────────────────────────────

  const init = useCallback(async () => {
    await requestNotificationPermission();
    const allPets = await getPets();
    setPets(allPets);

    let savedCurrentId = await getCurrentPetId();
    if (!savedCurrentId && allPets.length > 0) {
      savedCurrentId = allPets[0].id;
    }
    setCurrentPetIdState(savedCurrentId);

    if (savedCurrentId) {
      const recs = await getRecords(savedCurrentId);
      setRecords(recs);
    } else {
      setRecords([]);
    }

    const reminders = await getAllUpcomingReminders(7);
    setUpcomingReminders(reminders);

    setLoading(false);
  }, []);

  useEffect(() => {
    init();
  }, [init]);

  // ─── Switch current pet ──────────────────────────────────────────────────

  const switchPet = useCallback(async (petId) => {
    setCurrentPetIdState(petId);
    await setCurrentPetId(petId);
    const recs = await getRecords(petId);
    setRecords(recs);
  }, []);

  // ─── Refresh ─────────────────────────────────────────────────────────────

  const refresh = useCallback(async () => {
    const allPets = await getPets();
    setPets(allPets);
    if (currentPetId) {
      const recs = await getRecords(currentPetId);
      setRecords(recs);
    }
    const reminders = await getAllUpcomingReminders(7);
    setUpcomingReminders(reminders);
  }, [currentPetId]);

  // ─── Pet CRUD ─────────────────────────────────────────────────────────────

  const handleAddPet = useCallback(async (petData) => {
    const newPet = await addPet(petData);
    const allPets = await getPets();
    setPets(allPets);
    // Auto-switch to new pet
    setCurrentPetIdState(newPet.id);
    await setCurrentPetId(newPet.id);
    setRecords([]);
    return newPet;
  }, []);

  const handleDeletePet = useCallback(async (petId) => {
    await deletePet(petId);
    const allPets = await getPets();
    setPets(allPets);

    if (currentPetId === petId) {
      const nextId = allPets.length > 0 ? allPets[0].id : null;
      setCurrentPetIdState(nextId);
      if (nextId) {
        await setCurrentPetId(nextId);
        const recs = await getRecords(nextId);
        setRecords(recs);
      } else {
        setRecords([]);
      }
    }

    const reminders = await getAllUpcomingReminders(7);
    setUpcomingReminders(reminders);
  }, [currentPetId]);

  // ─── Record CRUD ──────────────────────────────────────────────────────────

  const handleAddRecord = useCallback(async (recordData) => {
    if (!currentPetId) return null;
    const newRecord = await addRecord(currentPetId, recordData);

    // Schedule notification if there's a reminder date
    if (newRecord.nextReminderDate && (newRecord.type === 'vaccine' || newRecord.type === 'deworm')) {
      const notifId = await scheduleReminderNotification({
        petName: currentPet?.name || '你的宝贝',
        recordType: newRecord.type,
        reminderDate: newRecord.nextReminderDate,
        recordId: newRecord.id,
      });
      if (notifId) {
        // Store the notification ID in the record
        const recs = await getRecords(currentPetId);
        const idx = recs.findIndex((r) => r.id === newRecord.id);
        if (idx !== -1) {
          recs[idx].notificationId = notifId;
          const { saveRecords } = await import('../utils/storage');
          await saveRecords(currentPetId, recs);
          newRecord.notificationId = notifId;
        }
      }
    }

    const updatedRecords = await getRecords(currentPetId);
    setRecords(updatedRecords);
    const reminders = await getAllUpcomingReminders(7);
    setUpcomingReminders(reminders);
    return newRecord;
  }, [currentPetId, currentPet]);

  const handleDeleteRecord = useCallback(async (recordId) => {
    if (!currentPetId) return;
    // Cancel notification if any
    const rec = records.find((r) => r.id === recordId);
    if (rec?.notificationId) {
      await cancelNotification(rec.notificationId);
    }
    await deleteRecord(currentPetId, recordId);
    const updatedRecords = await getRecords(currentPetId);
    setRecords(updatedRecords);
    const reminders = await getAllUpcomingReminders(7);
    setUpcomingReminders(reminders);
  }, [currentPetId, records]);

  return {
    pets,
    currentPet,
    currentPetId,
    records,
    upcomingReminders,
    loading,
    switchPet,
    refresh,
    addPet: handleAddPet,
    deletePet: handleDeletePet,
    addRecord: handleAddRecord,
    deleteRecord: handleDeleteRecord,
  };
}
