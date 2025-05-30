import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'edu.uoc.beatmarket',
  appName: 'BeatMarket',
  webDir: 'www',
  plugins: {
    EdgeToEdge: {
      backgroundColor: '#1a1a1a'
    }
  }
};

export default config;
