const stubs = { axios: new URL('./axios.mjs', import.meta.url).href, lodash: new URL('./lodash.mjs', import.meta.url).href };

export async function resolve(specifier, context, nextResolve) {
  if(stubs[specifier]) return { url: stubs[specifier], shortCircuit: true };

  return nextResolve(specifier, context);
}
