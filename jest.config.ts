import type { Config } from '@jest/types';

// Configuración de Jest
const config: Config.InitialOptions = {

  roots: ['<rootDir>/src'],

  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },

};

export default config;
