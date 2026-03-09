[![CI](https://github.com/theluckystrike/webext-storage/actions/workflows/ci.yml/badge.svg)](https://github.com/theluckystrike/webext-storage/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@theluckystrike/webext-storage?color=green)](https://www.npmjs.com/package/@theluckystrike/webext-storage)
[![npm downloads](https://img.shields.io/npm/dt/@theluckystrike/webext-storage)](https://www.npmjs.com/package/@theluckystrike/webext-storage)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Chrome Extensions](https://img.shields.io/badge/Chrome-Extensions-orange)](https://developer.chrome.com/docs/extensions)
[![Firefox WebExtensions](https://img.shields.io/badge/Firefox-WebExtensions-orange)](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)

# @theluckystrike/webext-storage

A **type-safe, validated wrapper** around the Chrome and Firefox storage API for browser extensions. Define your storage schema once, and get full TypeScript autocompletion, compile-time type checking, and runtime validation everywhere.

Works seamlessly with **chrome.storage** (Manifest V3), **browser.storage** (Firefox), and **webextension-polyfill**.

---

## Table of Contents

- [Why Use webext-storage?](#why-use-webext-storage)
- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
  - [`defineSchema()`](#defineschemadefinition)
  - [`createStorage()`](#createstorageoptions)
  - [`TypedStorage` Methods](#typedstorage-methods)
- [Examples](#examples)
  - [Basic Usage](#basic-usage)
  - [Working with Complex Types](#working-with-complex-types)
  - [Watching for Changes](#watching-for-changes)
  - [Sync vs Local Storage](#sync-vs-local-storage)
- [Type Safety Explained](#type-safety-explained)
- [Comparison with Alternatives](#comparison-with-alternatives)
- [Migration Guide](#migration-guide)
- [Firefox and Polyfills](#firefox-and-polyfills)
- [Best Practices](#best-practices)
- [Related Packages](#related-packages)
- [License](#license)
- [About](#about)

---

## Why Use webext-storage?

Building browser extensions with the native Chrome storage API has pain points:

1. **No type safety** — typos in key names cause silent failures
2. **No validation** — storing wrong types corrupts your data
3. **No defaults** — you must manually handle unset values
4. **Verbose API** — `chrome.storage.local.get()` returns `any`

**webext-storage** solves all of these:

```typescript
// ❌ Raw Chrome API — error-prone
const result = await chrome.storage.local.get("theme");
// result.theme could be anything...

// ✅ webext-storage — fully typed and validated
const theme = await storage.get("theme"); // TypeScript knows it's "dark" | "light"
await storage.set("theme", "light");       // TypeScript rejects invalid values
```

---

## Features

| Feature | Description |
|---------|-------------|
| **Full TypeScript Support** | Type inference from schema definitions with autocomplete for keys and values |
| **Runtime Validation** | Automatic type checking when storing values |
| **Schema Defaults** | Values not in storage automatically return schema defaults |
| **Two-Way Type Safety** | Both compile-time (TypeScript) and runtime validation |
| **Watch/Observer Pattern** | Subscribe to changes on specific keys with cleanup |
| **Multi-Key Operations** | Get, set, and remove multiple keys in one call |
| **Local & Sync Support** | Use `local` for device-specific or `sync` for cross-device data |
| **Firefox Compatible** | Works with browser.storage and webextension-polyfill |
| **Zero Dependencies** | Lightweight — no runtime dependencies |
| **Frozen Schema** | Schema is immutable after creation |

---

## Installation

Install via npm or yarn:

```bash
# npm
npm install @theluckystrike/webext-storage

# yarn
yarn add @theluckystrike/webext-storage

# pnpm
pnpm add @theluckystrike/webext-storage
```

This package is published to the GitHub Package Registry. If you haven't configured npm to use the GitHub registry, add this to your `.npmrc`:

```
@theluckystrike:registry=https://npm.pkg.github.com
```

---

## Quick Start

```typescript
import { defineSchema, createStorage } from "@theluckystrike/webext-storage";

// 1. Define your schema with default values
const schema = defineSchema({
  theme: "dark" as "dark" | "light",
  fontSize: 14,
  enabled: true,
});

// 2. Create a typed storage instance
const storage = createStorage({ schema, area: "local" });

// 3. Read values — returns schema default if not set
const theme = await storage.get("theme"); // "dark" | "light"
const fontSize = await storage.get("fontSize"); // number

// 4. Write values — type-checked at compile time, validated at runtime
await storage.set("theme", "light"); // ✅ Valid
// await storage.set("theme", "invalid"); // ❌ TypeScript error!

// 5. Watch for changes
const unwatch = storage.watch("theme", (newValue, oldValue) => {
  console.log(`Theme changed from ${oldValue} to ${newValue}`);
  applyTheme(newValue);
});

// Later: unsubscribe
unwatch();
```

---

## API Reference

### `defineSchema(definition)`

An identity function that provides **TypeScript type narrowing** for your schema. It locks in literal types so that TypeScript can properly infer union types.

**Parameters:**
- `definition` — An object mapping keys to their default values

**Returns:** The same object with narrowed types

**Example:**
```typescript
const schema = defineSchema({
  theme: "dark" as "dark" | "light",
  count: 0,
  tags: [] as string[],
  config: { theme: "default" } as { theme: string },
});
```

> **Tip:** Use TypeScript type assertions (`as Type`) on string values to create union types. This gives you autocomplete for valid values.

---

### `createStorage(options)`

Creates a `TypedStorage` instance bound to a storage area.

**Parameters:**
```typescript
interface StorageOptions<S extends SchemaDefinition> {
  /** The schema that defines keys and their default values (from defineSchema) */
  schema: S;
  /** Which storage area to use: "local" or "sync". Defaults to "local" */
  area?: AreaName;
}
```

**Returns:** A `TypedStorage<S>` instance

**Example:**
```typescript
const localStorage = createStorage({ schema });
const syncStorage = createStorage({ schema, area: "sync" });
```

---

### `TypedStorage` Methods

All read and write methods are **async** and return **Promises**.

#### Read Operations

| Method | Description |
|--------|-------------|
| `get<K>(key: K)` | Get a single key. Returns stored value or schema default. |
| `getMany<K>(keys: K[])` | Get multiple keys. Returns object with requested values. |
| `getAll()` | Get all keys defined in schema. Returns full schema type. |

#### Write Operations

| Method | Description |
|--------|-------------|
| `set<K>(key: K, value: S[K])` | Set a single key-value pair. Validates type at runtime. |
| `setMany(items: Partial<SchemaType<S>>)` | Set multiple key-value pairs. |
| `remove<K>(key: K)` | Remove a single key. |
| `removeMany<K>(keys: K[])` | Remove multiple keys. |
| `clear()` | Remove all schema-defined keys. |

#### Observation

| Method | Description |
|--------|-------------|
| `watch<K>(key: K, callback: WatchCallback<S[K]>)` | Watch a key for changes. Returns `Unwatch` function. |

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `schema` | `Readonly<S>` | Frozen copy of the schema |
| `area` | `AreaName` | The storage area ("local" or "sync") |

---

## Examples

### Basic Usage

```typescript
import { defineSchema, createStorage } from "@theluckystrike/webext-storage";

const settingsSchema = defineSchema({
  notifications: true,
  autoSave: false,
  maxResults: 50,
});

const storage = createStorage({ schema: settingsSchema });

// Reading values
const notifications = await storage.get("notifications"); // boolean
const allSettings = await storage.getAll(); // { notifications: boolean, autoSave: boolean, maxResults: number }

// Writing values
await storage.set("notifications", false);
await storage.setMany({ autoSave: true, maxResults: 100 });
```

### Working with Complex Types

```typescript
const schema = defineSchema({
  // Arrays
  bookmarks: [] as string[],
  // Objects
  preferences: { darkMode: true } as { darkMode: boolean },
  // Nested unions via assertion
  view: "grid" as "grid" | "list" | "kanban",
});

const storage = createStorage({ schema });

// Arrays
await storage.set("bookmarks", ["https://example.com", "https://test.com"]);
const bookmarks = await storage.get("bookmarks"); // string[]

// Objects
await storage.set("preferences", { darkMode: false });
const prefs = await storage.get("preferences"); // { darkMode: boolean }

// TypeScript autocomplete for unions
await storage.set("view", "kanban"); // ✅ Works
// await storage.set("view", "calendar"); // ❌ TypeScript error!
```

### Watching for Changes

```typescript
const storage = createStorage({ schema });

// Watch a single key
const stopWatching = storage.watch("theme", (newValue, oldValue) => {
  console.log(`Theme changed from "${oldValue}" to "${newValue}"`);
  document.body.setAttribute("data-theme", newValue);
});

// When done, stop watching
stopWatching();

// Watch multiple keys — just call watch() multiple times
storage.watch("fontSize", (newSize) => {
  document.body.style.fontSize = `${newSize}px`;
});

storage.watch("notifications", (enabled) => {
  if (enabled) enableNotifications();
  else disableNotifications();
});
```

### Sync vs Local Storage

```typescript
// Local storage — data stays on this device
const localSettings = createStorage({
  schema: defineSchema({
    lastOpenedFile: "" as string,
    windowBounds: { width: 800, height: 600 } as { width: number; height: number },
  }),
  area: "local",
});

// Sync storage — syncs across user's signed-in browsers
const userSettings = createStorage({
  schema: defineSchema({
    theme: "dark" as "dark" | "light",
    bookmarks: [] as string[],
  }),
  area: "sync",
});

// Note: sync has lower storage limits (~100KB)
// Keep sync data small!
```

---

## Type Safety Explained

webext-storage provides **two layers** of type safety:

### 1. Compile-Time Safety (TypeScript)

```typescript
const schema = defineSchema({
  theme: "dark" as "dark" | "light",
  count: 0,
});

const storage = createStorage({ schema });

// ✅ TypeScript knows valid keys
await storage.get("theme");     // Returns: "dark" | "light"
await storage.get("count");    // Returns: number

// ❌ TypeScript errors on invalid keys
await storage.get("invalid");   // Compile error!
// Property 'invalid' does not exist on type...

// ❌ TypeScript errors on invalid values
await storage.set("count", "oops"); // Compile error!
// Argument of type 'string' is not assignable to parameter of type 'number'
```

### 2. Runtime Safety

Even if you bypass TypeScript (e.g., using `any`), the library validates at runtime:

```typescript
// This will throw a TypeError at runtime!
await storage.set("count", "not a number");

// Error: [@zovo/webext-storage] Key "count" expects type "number" but received "string"
```

---

## Comparison with Alternatives

| Feature | webext-storage | raw chrome.storage | @aspect-soft/webext-storage |
|---------|----------------|--------------------|---------------------------|
| TypeScript Support | ✅ Full | ❌ None | ✅ Basic |
| Runtime Validation | ✅ Yes | ❌ None | ❌ None |
| Schema Defaults | ✅ Automatic | ❌ Manual | ❌ None |
| Watch API | ✅ Type-safe | ✅ Native | ❌ None |
| Multi-Key Ops | ✅ Yes | ⚠️ Manual | ⚠️ Manual |
| Zero Dependencies | ✅ Yes | ✅ Yes | ❌ Yes |
| Firefox Support | ✅ Yes | ⚠️ Different API | ⚠️ Different API |

---

## Migration Guide

### From Raw chrome.storage

**Before:**
```typescript
// Raw Chrome API
const getSettings = async () => {
  const result = await chrome.storage.local.get(["theme", "fontSize"]);
  return {
    theme: result.theme ?? "dark",
    fontSize: result.fontSize ?? 14,
  };
};

const setTheme = async (theme: string) => {
  await chrome.storage.local.set({ theme });
};
```

**After:**
```typescript
// webext-storage
const schema = defineSchema({
  theme: "dark" as "dark" | "light",
  fontSize: 14,
});

const storage = createStorage({ schema });

const getSettings = async () => storage.getAll();
const setTheme = async (theme: "dark" | "light") => storage.set("theme", theme);
```

---

## Firefox and Polyfills

The library automatically detects and uses the available storage API:

1. **chrome.storage** — Used in Chrome, Edge, Opera, Brave
2. **browser.storage** — Used in Firefox with webextension-polyfill

```typescript
// This works in both Chrome and Firefox automatically:
const storage = createStorage({ schema });

// No need for browser-specific code!
await storage.get("theme");
```

If you're using [webextension-polyfill](https://github.com/mozilla/webextension-polyfill), it works out of the box — the library detects `browser.storage` automatically.

---

## Best Practices

1. **Define schemas at module level** — Create schemas once and reuse them
2. **Use type assertions for unions** — `"dark" as "dark" | "light"` enables autocomplete
3. **Prefer `setMany()` for bulk writes** — Reduces storage API calls
4. **Always unwatch when done** — Clean up watchers in React `useEffect` or component cleanup
5. **Keep sync data small** — Chrome's sync storage has ~100KB limits
6. **Validate on set** — The library validates automatically, trust the errors

---

## Related Packages

This package is part of the **@zovo/webext** toolkit for building browser extensions:

| Package | Description |
|---------|-------------|
| [`@theluckystrike/webext-storage`](https://github.com/theluckystrike/webext-storage) | Typed storage wrapper (this package) |
| [`@theluckystrike/webext-messaging`](https://github.com/theluckystrike/webext-messaging) | Type-safe message passing |
| [`@theluckystrike/webext-tabs`](https://github.com/theluckystrike/webext-tabs) | Typed tab utilities |

Visit **[zovo.one](https://zovo.one)** for documentation, guides, and Chrome extension resources.

Looking for a complete extension starter? Check out the **[Chrome Extension Toolkit](https://github.com/theluckystrike/chrome-extension-toolkit)** — a comprehensive template with Vite, TypeScript, React, and all the @zovo packages pre-configured.

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

## About

Built with ❤️ by **[theluckystrike](https://github.com/theluckystrike)**

Part of the **@zovo/webext** ecosystem — a collection of TypeScript packages for building professional Chrome extensions and Firefox add-ons.

- **Website**: [zovo.one](https://zovo.one)
- **GitHub**: [github.com/theluckystrike/webext-storage](https://github.com/theluckystrike/webext-storage)
- **Issues**: [github.com/theluckystrike/webext-storage/issues](https://github.com/theluckystrike/webext-storage/issues)

---

<p align="center">
  <a href="https://zovo.one">
    <img src="https://img.shields.io/badge/Part%20of-Zovo%20Webext-orange" alt="Part of Zovo Webext">
  </a>
</p>
