// import type { StorybookConfig } from '@storybook/react-webpack5';
import path from 'path';

const config = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-mdx-gfm',
    '@chromatic-com/storybook'
  ],

  async viteFinal(config) {
    // Merge custom configuration into the default config
    const { mergeConfig } = await import('vite');
    const { default: tsconfigPaths } = await import('vite-tsconfig-paths');

    return mergeConfig(config, {
      // Add dependencies to pre-optimization
      optimizeDeps: {
        // include: ['storybook-dark-mode'],
      },
      plugins: [tsconfigPaths()],
    });
  },

  //   if (!config.resolve) {
  //     config.resolve = {};
  //   }

  //   if (!config.module) {
  //     config.module = {};
  //   }

  //   if (!config.module.rules) {
  //     config.module.rules = [];
  //   }

  //   config.resolve.modules = [
  //     ...(config.resolve.modules || []),
  //     path.resolve(__dirname, '../src'),
  //   ];

  //   return config;
  // },
  staticDirs: ['./media'],

  framework: {
    name: '@storybook/react-vite',
    options: {}
  },

  docs: {
    autodocs: true
  }
};

export default config;
