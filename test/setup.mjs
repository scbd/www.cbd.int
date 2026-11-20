// Run with: node --import ./test/setup.mjs --test "test/**/*.test.mjs"
// Lets Node import the app's ESM sources, which reference CDN-loaded externals and browser globals.
import { registerHooks } from 'node:module';
import { resolve } from './stubs/hooks.mjs';

globalThis.window = { scbd: { apiUrl: 'https://gaia.test' } };

registerHooks({ resolve });
