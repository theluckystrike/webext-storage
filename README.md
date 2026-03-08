[![CI](https://github.com/theluckystrike/webext-storage/actions/workflows/ci.yml/badge.svg)](https://github.com/theluckystrike/webext-storage/actions)
[![npm](https://img.shields.io/npm/v/@theluckystrike/webext-storage)](https://www.npmjs.com/package/@theluckystrike/webext-storage)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

# @theluckystrike/webext-storage

A type-safe storage wrapper for browser extensions with schema validation. Define your storage schema once, and get full TypeScript autocompletion, runtime type checking, and change watching out of the box.

Works with `chrome.storage` (Chrome, Edge, Brave) and `browser.storage` (Firefox with webextension-polyfill).

## Why Use This Library?

The native Chrome storage API (`chrome.storage`) has two significant pain points:

1. **No type safety** — Keys are just strings, values are `any`. Easy to make typos or pass wrong types.
2. **No default values** — You have to manually check if keys exist and provide fallbacks every time.

This library solves both:

```typescript
// Before: No autocomplete, no validation
chrome.storage.local.get("theme", (result) => {
  const theme = result.theme ?? "dark"; // What if theme is null?
});

// After: Full type safety with schema defaults
const theme = await storage.get("theme"); // TypeScript knows it's "dark" | "light"
```

## Installation

```bash
npm install @theluckystrike/webext-storage
```

This package is published to the GitHub Package Registry. If you haven't added it to your `.npmrc`, add this to your project's `.npmrc`:

```
@theluckystrike:registry=https://npm.pkg.github.com
```

Or use the npm flag:

```bash
npm install @theluckystrike/webext-storage --registry=https://npm.pkg.github.com
```

## Quick Start

```typescript
import { defineSchema, createStorage } from "@theluckystrike/webext-storage";

// 1. Define your schema with default values
const schema = defineSchema({
  theme: "dark" as "dark" | "light",
  fontSize: 14,
  enabled: true,
  userName: null as string | null,
});

// 2. Create a typed storage instance
const storage = createStorage({ schema, area: "local" });

// 3. Use it with full type safety
const theme = await storage.get("theme");     // Type: "dark" | "light"
await storage.set("fontSize", 18);            // Type checked!

// 4. Watch for changes
const unwatch = storage.watch("theme", (newValue, oldValue) => {
  console.log(`Theme changed from ${oldValue} to ${newValue}`);
});

// Clean up watcher when done
unwatch();
```

## Key Features

### TypeScript-First Design

The library uses TypeScript's type system to catch errors at compile time:

```typescript
const schema = defineSchema({
  count: 0,
  name: "default",
});

// ✅ TypeScript knows exact types
await storage.set("count", 5);
await storage.set("name", "Alice");

// ❌ TypeScript Error: Argument of type '"unknown"' is not assignable
await storage.set("unknown", "value");

// ❌ TypeScript Error: Type 'number' is not assignable to type 'string'
await storage.set("name", 123);
```

### Runtime Validation

Even if TypeScript compilation passes, the library validates types at runtime:

```typescript
const schema = defineSchema({
  enabled: true,
});

// This will throw a TypeError at runtime
await storage.set("enabled", "yes" as any);
```

Runtime validation catches issues that might slip through in edge cases, like data corruption or cross-context communication.

### Automatic Default Values

Every `get()` call returns the schema default if no value is stored:

```typescript
const schema = defineSchema({
  theme: "dark" as "dark" | "light",
  visits: 0,
});

const storage = createStorage({ schema });

// Returns "dark" (the default) if nothing is stored
const theme = await storage.get("theme");

// Returns 0 if nothing is stored
const visits = await storage.get("visits");
```

### Change Watching

Subscribe to storage changes in real time:

```typescript
const unwatch = storage.watch("settings", (newValue, oldValue) => {
  console.log("Settings changed!", { newValue, oldValue });
});

// Later: clean up the watcher
unwatch();
```

The callback receives both the new value and the previous value, allowing you to react to specific changes.

## API Reference

### `defineSchema(schema)`

An identity function that preserves literal types in your schema. Use this to define your storage shape.

```typescript
const schema = defineSchema({
  // String literals become exact types
  theme: "dark" as "dark" | "light",
  
  // Numbers preserve their type
  count: 0,
  
  // Arrays need type assertion
  tags: [] as string[],
  
  // Null is explicitly supported
  userId: null as string | null,
});
```

### `createStorage(options)`

Creates a typed storage instance.

```typescript
const storage = createStorage({
  schema: defineSchema({ /* ... */ }),
  area: "local",  // or "sync", defaults to "local"
});
```

#### Options

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `schema` | `SchemaDefinition` | Yes | — | Object defining keys and default values |
| `area` | `"local" \| "sync"` | No | `"local"` | Which storage area to use |

### TypedStorage Methods

#### `get(key)`

Returns the stored value, or the schema default if unset.

```typescript
const theme = await storage.get("theme");
```

#### `getMany(keys)`

Returns an object with values for the requested keys.

```typescript
const { theme, fontSize } = await storage.getMany(["theme", "fontSize"]);
```

#### `getAll()`

Returns all schema keys and their values.

```typescript
const all = await storage.getAll();
// { theme: "dark", fontSize: 14, enabled: true }
```

#### `set(key, value)`

Stores a value. Type-checked at compile time, validated at runtime.

```typescript
await storage.set("theme", "light");
```

#### `setMany(items)`

Stores multiple values at once.

```typescript
await storage.setMany({
  theme: "light",
  fontSize: 18,
});
```

#### `remove(key)`

Removes a key from storage. The key returns to its default on next read.

```typescript
await storage.remove("theme");
```

#### `removeMany(keys)`

Removes multiple keys.

```typescript
await storage.removeMany(["theme", "fontSize"]);
```

#### `clear()`

Removes all schema-defined keys from storage.

```typescript
await storage.clear();
```

#### `watch(key, callback)`

Watches a specific key for changes. Returns an unwatch function.

```typescript
const unwatch = storage.watch("theme", (newValue, oldValue) => {
  console.log(`Theme: ${oldValue} → ${newValue}`);
});

// Stop watching
unwatch();
```

## Storage Areas

### Local Storage

```typescript
const storage = createStorage({ schema, area: "local" });
```

Use `local` for data that should stay on the current device. No sync across browsers. Higher storage limits (typically 5MB).

### Sync Storage

```typescript
const storage = createStorage({ schema, area: "sync" });
```

Use `sync` for data that should follow the user across their signed-in browsers. Lower storage limits (typically 100KB). Requires the user to be signed into Chrome with sync enabled.

## Browser Compatibility

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome | ✅ Full | Uses `chrome.storage` |
| Edge | ✅ Full | Uses `chrome.storage` |
| Brave | ✅ Full | Uses `chrome.storage` |
| Firefox | ✅ Full | Uses `browser.storage` with polyfill |
| Safari | ⚠️ Limited | No official WebExtension storage API |

The library automatically detects whether `chrome.storage` or `browser.storage` is available and uses the appropriate API.

### Using with Firefox

If you're using [webextension-polyfill](https://github.com/mozilla/webextension-polyfill), this library works out of the box:

```javascript
// In your manifest.json
{
  "browser_specific_settings": {
    "gecko": {
      "id": "your-extension@example.com",
      "strict_min_version": "109.0"
    }
  }
}
```

```javascript
// In your code - the polyfill must be loaded first
import browser from "webextension-polyfill";
window.browser = browser;

import { createStorage, defineSchema } from "@theluckystrike/webext-storage";
// Now works with Firefox!
```

## Migration from Raw chrome.storage

### Before

```typescript
// Reading with defaults
chrome.storage.local.get(["theme", "fontSize"], (result) => {
  const theme = (result.theme as string) ?? "dark";
  const fontSize = (result.fontSize as number) ?? 14;
});

// Writing
chrome.storage.local.set({ theme: "light" });

// Watching
chrome.storage.onChanged.addListener((changes, area) => {
  if (changes.theme) {
    console.log("Theme changed:", changes.theme.newValue);
  }
});
```

### After

```typescript
const schema = defineSchema({
  theme: "dark" as "dark" | "light",
  fontSize: 14,
});

const storage = createStorage({ schema, area: "local" });

// Reading — cleaner, with defaults
const { theme, fontSize } = await storage.getMany(["theme", "fontSize"]);

// Writing
await storage.set("theme", "light");

// Watching — typed, key-specific
storage.watch("theme", (newValue, oldValue) => {
  console.log("Theme changed:", newValue);
});
```

## Error Handling

The library throws descriptive errors to help you debug issues:

### Unknown Key

```typescript
await storage.get("nonexistent");
// Error: [@theluckystrike/webext-storage] Unknown key "nonexistent". Valid keys: theme, fontSize, enabled
```

### Type Mismatch

```typescript
await storage.set("theme", 123);
// Error: [@theluckystrike/webext-storage] Key "theme" expects type "string" but received "number".
```

### Storage API Unavailable

```typescript
// Error: [@theluckystrike/webext-storage] chrome.storage API is not available.
// Are you running inside a browser extension context?
```

## Best Practices

### 1. Define Your Schema Once

Create your storage instance in a separate module and import it throughout your extension:

```typescript
// src/storage.ts
import { defineSchema, createStorage } from "@theluckystrike/webext-storage";

export const storage = createStorage({
  schema: defineSchema({
    theme: "dark" as "dark" | "light",
    // ... other keys
  }),
});
```

```typescript
// src/popup.ts
import { storage } from "./storage";

const theme = await storage.get("theme");
```

### 2. Use Union Types for Enums

```typescript
const schema = defineSchema({
  // Good: Exact union type
  status: "active" as "active" | "inactive" | "pending",
  
  // Avoid: Loose string type
  // status: "active", // Too broad!
});
```

### 3. Handle Null Explicitly

```typescript
const schema = defineSchema({
  // Explicitly allow null
  userId: null as string | null,
  
  // Or use undefined for optional values
  // (note: storage doesn't distinguish between unset and undefined)
});
```

### 4. Clean Up Watchers

```typescript
// In popup.ts - clean up when popup closes
const unwatch = storage.watch("settings", handler);

window.addEventListener("unload", () => {
  unwatch();
});
```

## Contributing

Contributions are welcome! Please read our [contributing guidelines](CONTRIBUTING.md) before submitting PRs.

### Development Setup

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Type check
npm run typecheck

# Build
npm run build
```

## Related Packages

This package is part of the Chrome Extension Toolkit:

- [@theluckystrike/webext-messaging](https://github.com/theluckystrike/webext-messaging) — Promise-based message passing
- [@theluckystrike/webext-permissions](https://github.com/theluckystrike/webext-permissions) — Simplified optional permissions

## License

MIT License — see [LICENSE](LICENSE) for details.

## About

Built by [theluckystrike](https://github.com/theluckystrike) at [Zovo](https://zovo.one), a studio for Chrome extensions and browser tools.

Part of the **[Chrome Extension Toolkit](https://github.com/theluckystrike/chrome-extension-toolkit)** — templates, packages, and guides for building professional Chrome extensions.
