import { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'app.lovable.7c725e17fd7c44d8b0da685df81c00b8',
  appName: 'UrbanRide',
  webDir: 'dist',
  server: {
    url: 'https://7c725e17-fd7c-44d8-b0da-685df81c00b8.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    }
  }
};

export default config;
