import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';

// 1. Configure how notifications behave when the app is open
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function Layout() {

  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
      }

      // <--- FIXED: Hardcoded Project ID to prevent crash --->
      const projectId = "1fdbf5fa-a04f-44a7-8537-bc4ac069961e";

      try {
          const tokenData = await Notifications.getExpoPushTokenAsync({
            projectId: projectId, 
          });
          token = tokenData.data;
          console.log("My Push Token:", token);
      } catch (e) {
          console.log("Error fetching token:", e);
      }
    } else {
      console.log('Must use physical device for Push Notifications');
    }
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}