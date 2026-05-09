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

  // Notifications (physical device only)
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    results.notifications = finalStatus === 'granted';

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('reminders', {
        name: 'Reminders',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#6366f1',
        sound: 'reminder_alarm.wav',
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        bypassDnd: false,
        enableLights: true,
        enableVibrate: true,
      });
    }
  } else {
    console.warn('[Permissions] Push notifications require a physical device');
  }

  // Camera
  const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
  results.camera = cameraStatus === 'granted';

  // Media Library
  const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  results.mediaLibrary = mediaStatus === 'granted';

  // Microphone
  const { status: micStatus } = await Audio.requestPermissionsAsync();
  results.microphone = micStatus === 'granted';

  return results;
}
