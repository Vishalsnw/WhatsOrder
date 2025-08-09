'use client';

import { useEffect, useState } from 'react';

// Dynamic imports for Capacitor to avoid build errors on web
let Capacitor: any;
let Camera: any;
let Geolocation: any;
let PushNotifications: any;
let LocalNotifications: any;
let Storage: any; // Keep this for now, but it will be replaced by Preferences
let Preferences: any; // New import for Preferences
let Share: any;
let Device: any;
let Network: any;

if (typeof window !== 'undefined') {
  import('@capacitor/core').then(module => {
    Capacitor = module.Capacitor;
  });
  import('@capacitor/camera').then(module => {
    Camera = module.Camera;
  });
  import('@capacitor/geolocation').then(module => {
    Geolocation = module.Geolocation;
  });
  import('@capacitor/push-notifications').then(module => {
    PushNotifications = module.PushNotifications;
  });
  import('@capacitor/local-notifications').then(module => {
    LocalNotifications = module.LocalNotifications;
  });
  import('@capacitor/storage').then(module => { // This import is no longer directly used but kept for context if needed.
    Storage = module.Storage;
  });
  import('@capacitor/preferences').then(module => { // Import the new Preferences API
    Preferences = module.Preferences;
  });
  import('@capacitor/share').then(module => {
    Share = module.Share;
  });
  import('@capacitor/device').then(module => {
    Device = module.Device;
  });
  import('@capacitor/network').then(module => {
    Network = module.Network;
  });
}


export const useNativeFeatures = () => {
  const [isNative, setIsNative] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [networkStatus, setNetworkStatus] = useState<any>(null);

  useEffect(() => {
    if (Capacitor) {
      setIsNative(Capacitor.isNativePlatform());

      if (Capacitor.isNativePlatform()) {
        initializeNativeFeatures();
      }
    }
  }, []);

  const initializeNativeFeatures = async () => {
    try {
      // Get device info
      const info = await Device.getInfo();
      setDeviceInfo(info);

      // Get network status
      const status = await Network.getStatus();
      setNetworkStatus(status);

      // Listen for network changes
      Network.addListener('networkStatusChange', (status) => {
        setNetworkStatus(status);
      });

      // Initialize push notifications
      await initializePushNotifications();
    } catch (error) {
      console.error('Error initializing native features:', error);
    }
  };

  const initializePushNotifications = async () => {
    try {
      // Request permission for push notifications
      let permStatus = await PushNotifications.checkPermissions();

      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }

      if (permStatus.receive !== 'granted') {
        throw new Error('User denied permissions!');
      }

      await PushNotifications.register();

      // On success, we should be able to receive notifications
      PushNotifications.addListener('registration', (token) => {
        console.log('Push registration success, token: ' + token.value);
        // Send token to your server
      });

      PushNotifications.addListener('registrationError', (error) => {
        console.error('Error on registration: ' + JSON.stringify(error));
      });

      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Push received: ' + JSON.stringify(notification));
      });

      PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('Push action performed: ' + JSON.stringify(notification));
      });
    } catch (error) {
      console.error('Push notification setup failed:', error);
    }
  };

  const takePicture = async () => {
    try {
      if (!Camera) throw new Error('Camera not available');

      const { CameraResultType, CameraSource } = await import('@capacitor/camera');
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Prompt, // Let user choose camera or gallery
      });

      return image.webPath;
    } catch (error) {
      console.error('Error taking picture:', error);
      throw error;
    }
  };

  const getCurrentLocation = async () => {
    try {
      if (!Geolocation) throw new Error('Geolocation not available');

      const coordinates = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
      });

      return {
        latitude: coordinates.coords.latitude,
        longitude: coordinates.coords.longitude,
      };
    } catch (error) {
      console.error('Error getting location:', error);
      throw error;
    }
  };

  const scheduleNotification = async (title: string, body: string, scheduleAt?: Date) => {
    try {
      if (!LocalNotifications) throw new Error('Local notifications not available');

      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id: Date.now(),
            schedule: scheduleAt ? { at: scheduleAt } : undefined,
          },
        ],
      });
    } catch (error) {
      console.error('Error scheduling notification:', error);
      throw error;
    }
  };

  const storeData = async (key: string, value: string) => {
    try {
      if (!Preferences) {
        // Fallback to localStorage for web
        localStorage.setItem(key, value);
        return;
      }
      await Preferences.set({ key, value });
    } catch (error) {
      console.error('Error storing data:', error);
      throw error;
    }
  };

  const getData = async (key: string) => {
    try {
      if (!Preferences) {
        // Fallback to localStorage for web
        return localStorage.getItem(key);
      }
      const { value } = await Preferences.get({ key });
      return value;
    } catch (error) {
      console.error('Error getting data:', error);
      throw error;
    }
  };

  const shareContent = async (title: string, text: string, url?: string) => {
    try {
      if (!Share) {
        // Fallback to Web Share API
        if (navigator.share) {
          await navigator.share({ title, text, url });
        } else {
          throw new Error('Share not available');
        }
        return;
      }
      await Share.share({
        title,
        text,
        url,
      });
    } catch (error) {
      console.error('Error sharing:', error);
      throw error;
    }
  };

  return {
    isNative,
    deviceInfo,
    networkStatus,
    takePicture,
    getCurrentLocation,
    scheduleNotification,
    storeData,
    getData,
    shareContent,
  };
};