// @ts-nocheck
import { esbuildCommonjs, viteCommonjs } from '@originjs/vite-plugin-commonjs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import * as path from 'path';
import { dependencies } from './package.json';

const renderChunks = (deps: Record<string, string>) => {
  const chunks: any = {};
  Object.keys(deps).forEach((key) => {
    if (['react', 'react-router-dom', 'react-dom', 'stream-browserify'].includes(key)) return;
    chunks[key] = [key];
  });
  return chunks;
};

// https://vitejs.dev/config/
export default defineConfig({
  exclude: ['@near-wallet-selector/nightly-connect', '@solana/wallet-adapter-base'],
  include: ['@near-wallet-selector/nightly-connect', 'bn.js'],
  esbuildOptions: {
    target: 'es2020',
    plugins: [esbuildCommonjs(['react-flagpack'])],
  },
  resolve: {
    alias: {
      store: path.resolve('./src/store'),
      constants: path.resolve('./src/constants'),
      components: path.resolve('./src/components'),
      hooks: path.resolve('./src/hooks'),
      pages: path.resolve('./src/pages'),
      resources: path.resolve('./src/resources'),
      services: path.resolve('./src/services'),
      utils: path.resolve('./src/utils'),
      connectors: path.resolve('./src/connectors'),
      language: path.resolve('./src/language'),
      hoc: path.resolve('./src/hoc'),
      context: path.resolve('./src/context'),

      process: 'process/browser',
      'readable-stream': 'vite-compatible-readable-stream',
      zlib: 'browserify-zlib',
      util: 'util',
      pino: 'pino',
    },
  },
  plugins: [react(), viteCommonjs()],
  build: {
    manifest: true,
    sourcemap: false,
    outDir: path.join(__dirname, 'dist'),
    target: 'es2020',
    rollupOptions: {
      // output: {
      //   manualChunks: {
      //     vendor: ['react', 'react-router-dom', 'react-dom', 'stream-browserify'],
      //     ...renderChunks(dependencies),
      //   },
      // },
    },
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
});
