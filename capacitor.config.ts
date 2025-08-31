import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.institutodossonhos.app',
  appName: 'Instituto dos Sonhos',
  webDir: 'dist',
  server: {
    url: 'https://plataforma.institutodossonhos.com.br',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    }
  }
};

export default config;