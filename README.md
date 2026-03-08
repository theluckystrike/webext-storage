<div align="center">

# @theluckystrike/webext-storage

Typed Chrome storage wrapper with schema validation. Define your schema once, get autocompletion and runtime type checking everywhere.

[![npm version](https://img.shields.io/npm/v/@theluckystrike/webext-storage)](https://www.npmjs.com/package/@theluckystrike/webext-storage)
[![npm downloads](https://img.shields.io/npm/dm/@theluckystrike/webext-storage)](https://www.npmjs.com/package/@theluckystrike/webext-storage)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/@theluckystrike/webext-storage)

[Installation](#installation) · [Quick Start](#quick-start) · [API](#api) · [License](#license)

</div>

---

## Features

- **Schema-driven** -- define defaults and types in one place
- **Runtime validation** -- type-checks values before writing to storage
- **Watch changes** -- subscribe to key-level storage changes
- **Sync + local** -- supports both `chrome.storage.local` and `chrome.storage.sync`
- **Firefox compatible** -- falls back to `browser.storage` automatically
- **Full CRUD** -- `get`, `getMany`, `getAll`, `set`, `setMany`, `remove`, `clear`

## Installation

```bash
npm install @theluckystrike/webext-storage
```

<details>
<summary>Other package managers</summary>

```bash
pnpm add @theluckystrike/webext-storage
# or
yarn add @theluckystrike/webext-storage
```

</details>

## Quick Start

```typescript
import { defineSchema, createStorage } from "@theluckystrike/webext-storage";

const schema = defineSchema({
  theme: "dark" as "dark" | "light",
  fontSize: 14,
  enabled: true,
});

const storage = createStorage({ schema, area: "local" });

const theme = await storage.get("theme");        // typed as "dark" | "light"
await storage.set("fontSize", 16);               // type-checked
const unsub = storage.watch("theme", (n, o) => { /* ... */ });
```

## API

| Method | Description |
|--------|-------------|
| `defineSchema(defaults)` | Locks in literal types for your schema |
| `createStorage({ schema, area })` | Returns a `TypedStorage` instance |
| `get(key)` | Read a value (returns schema default if unset) |
| `getMany(keys)` / `getAll()` | Batch reads |
| `set(key, value)` / `setMany(items)` | Write with runtime validation |
| `remove(key)` / `removeMany(keys)` / `clear()` | Delete keys |
| `watch(key, callback)` | Subscribe to changes, returns unsubscribe function |

## Permissions

```json
{ "permissions": ["storage"] }
```

## Part of @zovo/webext

This package is part of the [@zovo/webext](https://github.com/theluckystrike) family -- typed, modular utilities for Chrome extension development:

| Package | Description |
|---------|-------------|
| [webext-storage](https://github.com/theluckystrike/webext-storage) | Typed storage with schema validation |
| [webext-messaging](https://github.com/theluckystrike/webext-messaging) | Type-safe message passing |
| [webext-tabs](https://github.com/theluckystrike/webext-tabs) | Tab query helpers |
| [webext-cookies](https://github.com/theluckystrike/webext-cookies) | Promise-based cookies API |
| [webext-i18n](https://github.com/theluckystrike/webext-i18n) | Internationalization toolkit |

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License -- see [LICENSE](LICENSE) for details.

---

<div align="center">

Built by [theluckystrike](https://github.com/theluckystrike) · [zovo.one](https://zovo.one)

</div>
