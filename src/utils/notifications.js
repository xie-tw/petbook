import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

export function configureNotifications() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function requestNotificationPermission() {
  if (!Device.isDevice) return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') return false;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('petbook', {
      name: 'PetBook 提醒',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  return true;
}

/**
 * Schedule a local notification for a reminder date.
 * Returns the notification identifier.
 */
export async function scheduleReminderNotification({ petName, recordType, reminderDate, recordId }) {
  const typeLabels = {
    vaccine: '打疫苗',
    deworm: '做驱虫',
  };
  const label = typeLabels[recordType] || '健康检查';
  const cuteName = petName;

  const trigger = new Date(reminderDate);
  // If the date is in the past, skip
  if (trigger <= new Date()) return null;

  // Set to 9:00 AM on the reminder day
  trigger.setHours(9, 0, 0, 0);
  if (trigger <= new Date()) return null;

  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: `🐾 ${cuteName} 该${label}啦！`,
      body: `别忘了带 ${cuteName} 去${label}，别让主子生病哦~ 🐾`,
      data: { recordId, petName, recordType },
    },
    trigger,
  });
  return identifier;
}

/**
 * Cancel a previously scheduled notification.
 */
export async function cancelNotification(notificationId) {
  if (!notificationId) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch {
    // Ignore errors
  }
}

/**
 * Cancel all scheduled notifications.
 */
export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
