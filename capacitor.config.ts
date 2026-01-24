import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.intake.protein',
  appName: 'Intake',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;