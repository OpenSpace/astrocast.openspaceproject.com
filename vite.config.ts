import babel from '@rolldown/plugin-babel';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const serverURL = new URL(env.VITE_SERVER_URL ?? 'http://localhost:25000');
  const serverAPIPath = env.VITE_SERVER_API_PATH ?? '/api/v1';

  return {
    plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
    resolve: {
      alias: {
        '@/api': '/src/api',
        '@/components': '/src/components',
        '@/config': '/src/config',
        '@/firebase': '/src/firebase',
        '@/icons': '/src/icons',
        '@/hooks': '/src/hooks',
        '@/pages': '/src/pages',
        '@/redux': '/src/redux',
        '@/types': '/src/types',
        '@/utils': '/src/utils'
      }
    },
    server: {
      proxy: {
        [serverAPIPath]: {
          target: serverURL.origin
        }
      }
    }
  };
});
