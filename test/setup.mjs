// Run with: node --import ./test/setup.mjs --test "test/**/*.test.mjs"
// Lets Node import the app's ESM sources, which reference CDN-loaded externals and browser globals.
import { register } from 'node:module';

globalThis.window = { scbd: { apiUrl: 'https://gaia.test' } };

register('./stubs/hooks.mjs', import.meta.url);
