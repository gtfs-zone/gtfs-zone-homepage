import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  entry: [
    // Standalone scripts invoked directly (not imported by other modules)
    'scripts/**/*.ts',
  ],
  project: ['src/**/*.{ts,css}', 'scripts/**/*.ts'],
  ignoreBinaries: [
    'cz', // commitizen CLI
  ],
  ignoreExportsUsedInFile: true,
};

export default config;
