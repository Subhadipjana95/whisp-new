import * as Notifications from 'expo-notifications';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

export interface PermissionResult {
  notifications: boolean;
  camera: boolean;
  mediaLibrary: boolean;
  microphone: boolean;
}

export async function requestAllPermissions(): Promise<PermissionResult> {
  const results: PermissionResult = {
    notifications: false,
    camera: false,
    mediaLibrary: false,
    microphone: false,
  };

  // Notifications
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    results.notifications = finalStatus === 'granted';

    if (results.notifications && Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('reminders', {
        name: 'Reminders',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#5e6ad2',
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      });
    }
  } catch (err) {
    console.error('[Permissions] Notification permission error:', err);
  }

  // Camera
  const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
  results.camera = cameraStatus === 'granted';

  // Media Library
  const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  results.mediaLibrary = mediaStatus === 'granted';

  // Microphone
  const { status: existingMicStatus } = await Audio.getPermissionsAsync();
  let finalMicStatus = existingMicStatus;
  if (existingMicStatus !== 'granted' && existingMicStatus !== 'denied') {
    const { status } = await Audio.requestPermissionsAsync();
    finalMicStatus = status;
  }
  results.microphone = finalMicStatus === 'granted';

  return results;
}
