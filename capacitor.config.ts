import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.futebolstats.app',
  appName: 'FutebolStats',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#2d5016",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#ffffff",
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: "launch_screen",
      useDialog: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#2d5016',
    },
    ScreenOrientation: {
      orientation: 'landscape'
    }
  },
  ios: {
    contentInset: 'automatic',
    scrollEnabled: false,
    backgroundColor: '#2d5016'
  }
};

export default config;