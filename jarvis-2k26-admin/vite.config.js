import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on current mode to get the GAS URL for the proxy
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api/admin': {
          target: env.VITE_ADMIN_GAS_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/admin/, ''),
        },
      },
    },
  };
});
