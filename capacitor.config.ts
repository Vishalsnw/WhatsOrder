
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.whatsorder.app',
  appName: 'WhatsOrder',
  // The 'webDir' should point to the static export of your Next.js app.
  // To generate this, add 'output: "export"' to your next.config.ts
  // and run 'npm run build'. The output will be in the 'out' folder.
  webDir: 'out',
  // The 'server.url' is for live-reloading during development.
  // Point it to your Next.js dev server.
  // Make sure to use your computer's IP address, not localhost.
  server: {
    url: 'http://192.168.1.100:5000', // <-- Replace with your computer's local IP address
    cleartext: true,
  },
  plugins: {
    SplashScreen: {
      // Set launchAutoHide to false to hide the splash screen programmatically
      // when your app is ready.
      launchShowDuration: 0,
      launchAutoHide: false,
      backgroundColor: "#3b82f6",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#488AFF",
      sound: "beep.wav",
    },
    Camera: {
      androidPhotoPickerGallery: true,
    },
  },
};

export default config;
