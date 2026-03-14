[![npm](https://img.shields.io/npm/v/@theluckystrike/webext-storage)](https://www.npmjs.com/package/@theluckystrike/webext-storage)
[![CI](https://github.com/theluckystrike/webext-storage/actions/workflows/ci.yml/badge.svg)](https://github.com/theluckystrike/webext-storage/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

# @theluckystrike/webext-storage

Type-safe storage API wrapper for Chrome extensions. Zero dependencies. Full MV3 support.

## Install

```bash
npm install @theluckystrike/webext-storage
```

## Usage

```typescript
import { defineSchema, createStorage } from "@theluckystrike/webext-storage";

const schema = defineSchema({
  theme: "dark" as "dark" | "light",
  fontSize: 14,
  enabled: true,
});

const storage = createStorage({ schema, area: "local" });

// Type-safe get — returns schema default if unset
const theme = await storage.get("theme"); // "dark" | "light"

// Type-safe set — validated at compile time and runtime
await storage.set("fontSize", 18);

// Reactive updates
const unwatch = storage.watch("theme", (newVal, oldVal) => {
  console.log(`Theme changed: ${oldVal} -> ${newVal}`);
});
```

## API

| Method | Description |
|--------|-------------|
| `get(key)` | Get a value (returns schema default if unset) |
| `getMany(keys)` | Get multiple values |
| `getAll()` | Get all schema-defined values |
| `set(key, value)` | Set a value (type-checked) |
| `setMany(items)` | Set multiple values |
| `remove(key)` | Remove a key (reverts to default) |
| `clear()` | Remove all schema keys |
| `watch(key, cb)` | Subscribe to changes, returns unwatch function |

## Why not raw `chrome.storage`?

| | `chrome.storage` | `webext-storage` |
|---|---|---|
| **Type safety** | Keys are strings, values are `any` | Full TypeScript inference from schema |
| **Defaults** | Manual fallback on every read | Automatic from schema definition |
| **Validation** | None | Runtime type checking on writes |
| **Change watching** | Global listener, manual key filtering | Per-key subscriptions with cleanup |

Works with `chrome.storage` (Chrome, Edge, Brave) and `browser.storage` (Firefox via polyfill).

## Related Packages

- [`@theluckystrike/webext-messaging`](https://github.com/theluckystrike/webext-messaging) -- Type-safe message passing for extensions
- [`@theluckystrike/webext-permissions`](https://github.com/theluckystrike/webext-permissions) -- Declarative optional permissions API

## License

MIT
