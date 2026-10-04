import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      port: 5174,
      strictPort: true,
      proxy: {
        '/api/admin': {
          target: env.VITE_ADMIN_GAS_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/admin/, ''),
          configure: (proxy, _options) => {
            proxy.on('proxyReq', (proxyReq, req, res) => {
              // Remove headers that might trigger Google's login redirect
              proxyReq.removeHeader('Cookie');
              proxyReq.removeHeader('User-Agent');
            });
          },
        },
      },
    },
  };
});
