
'use client';

import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Storage } from '@capacitor/storage';
import { Share } from '@capacitor/share';
import { Device } from '@capacitor/device';
import { Network } from '@capacitor/network';

export const useNativeFeatures = () => {
  const [isNative, setIsNative] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [networkStatus, setNetworkStatus] = useState<any>(null);

  useEffect(() => {
    setIsNative(Capacitor.isNativePlatform());
    
    if (Capacitor.isNativePlatform()) {
      initializeNativeFeatures();
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
      await Storage.set({ key, value });
    } catch (error) {
      console.error('Error storing data:', error);
      throw error;
    }
  };

  const getData = async (key: string) => {
    try {
      const { value } = await Storage.get({ key });
      return value;
    } catch (error) {
      console.error('Error getting data:', error);
      throw error;
    }
  };

  const shareContent = async (title: string, text: string, url?: string) => {
    try {
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
