import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    env: {
      VITE_API_BASE_URL: 'http://localhost:3000',
    },
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/app/components/common/empty-state.tsx', 'src/app/components/common/error-boundary.tsx', 'src/app/components/common/kpi-card.tsx', 'src/app/components/common/status-badge.tsx', 'src/app/components/common/loading-skeleton.tsx', 'src/app/routes/index.tsx', 'src/app/routes/orders/index.tsx'],
      exclude: ['src/main.tsx', 'src/vite-env.d.ts', 'src/**/*.d.ts', 'src/test/**', 'src/tests/**'],
    },
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
})
