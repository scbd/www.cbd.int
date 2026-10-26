// Stand-in for the lodash functions api.js imports (lodash is loaded from a CDN by the app, not in node_modules).
export const isFunction    = (v) => typeof v === 'function';
export const isEmpty       = (v) => v == null || (typeof v === 'object' && Object.keys(v).length === 0);
export const isPlainObject = (v) => v !== null && typeof v === 'object' && Object.getPrototypeOf(v) === Object.prototype;
export const cloneDeep     = (v) => structuredClone(v);
