import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.2e882832a7454ee0a0509b67c3f2bde5',
  appName: 'العد التنازلي',
  webDir: 'dist',
  server: {
    url: 'https://2e882832-a745-4ee0-a050-9b67c3f2bde5.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#F5F2E8',
      showSpinner: false
    }
  }
};

export default config;