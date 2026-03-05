// Ambient declaration so TypeScript knows about the `browser` global
// used by Firefox WebExtensions (and polyfills).
declare const browser: typeof chrome | undefined;
