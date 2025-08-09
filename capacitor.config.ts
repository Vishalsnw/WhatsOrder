
// Import CapacitorConfig type conditionally to avoid build errors on web
let CapacitorConfig: any;
try {
  CapacitorConfig = require('@capacitor/cli').CapacitorConfig;
} catch {
  // Fallback for web builds where Capacitor isn't installed
  CapacitorConfig = Object;
}

const config: any = {
  appId: 'com.whatsorder.app',
  appName: 'WhatsOrder',
  webDir: '.next',
  bundledWebRuntime: false,
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#3b82f6",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#488AFF",
      sound: "beep.wav"
    }
  }
};

export default config;
