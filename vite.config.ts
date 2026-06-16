import babel from '@rolldown/plugin-babel';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
  resolve: {
    alias: {
      '@/api': '/src/api',
      '@/components': '/src/components',
      '@/icons': '/src/icons',
      '@/hooks': '/src/hooks',
      '@/pages': '/src/pages',
      '@/redux': '/src/redux',
      '@/types': '/src/types'
    }
  }
});
