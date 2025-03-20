import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths';
import dts from 'vite-plugin-dts'
import { extname, relative, resolve } from 'path'
import glob from 'glob'
import react from '@vitejs/plugin-react'


export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'TelegramUI',
      formats: ['es']
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      input: Object.fromEntries(
        glob.sync('src/**/*.{ts,tsx}', {
          ignore: ["src/**/*.d.ts", "src/**/*.stories.tsx"],
        }).map(file => [
          relative(
            'src',
            file.slice(0, file.length - extname(file).length)
          ),
          fileURLToPath(new URL(file, import.meta.url))
        ])
      ),
      output: {
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
        assetFileNames: 'assets/[name][extname]',
        globals: {
          react: 'React',
          'react-dom': 'React-dom',
          'react/jsx-runtime': 'react/jsx-runtime',
        },
      },
    },
    // target: 'node20',
    outDir: 'dist',
  },
  plugins: [
    tsconfigPaths(),
    react(),
    dts({ include: ['src'] })
  ],
})