import path, { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths';
import dts from 'vite-plugin-dts'
import { globSync } from 'node:fs';



export default defineConfig({
  build: {
    // lib: {
    //   entry: 'src/index.ts',
    //   name: 'TelegramUI',
    //   formats: ['es']
    // },
    rollupOptions: {
      // input,
      preserveModules: true,
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      input: Object.fromEntries(
        globSync(['src/components/**/*.tsx', 'src/**/*.ts'])
          .filter(e => !e.includes(".stories."))
          .map((file) => {
            const entryName = path.relative(
              'src',
              file.slice(0, file.length - path.extname(file).length)
            )
            const entryUrl = fileURLToPath(new URL(file, import.meta.url))
            return [entryName, entryUrl]
          })
      ),
      
      output: {
        preserveModulesRoot: 'src', // maintain folder structure relative to src
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: 'assets/[name][extname]',
        format:'esm',
        globals: {
          react: 'React',
          'react-dom': 'React-dom',
          'react/jsx-runtime': 'react/jsx-runtime',
        },
      },
    },
    target: 'node20',
    outDir: 'dist',
  },
  plugins: [tsconfigPaths(), dts()],
})