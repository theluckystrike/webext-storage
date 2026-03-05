# @zovo/webext-storage

Typed Chrome storage wrapper with schema validation. Part of [@zovo/webext](https://zovo.one).

Define your storage schema once, get full TypeScript autocompletion and runtime type validation for every `get`, `set`, `remove`, and `watch` call.

## Install

```bash
npm install @zovo/webext-storage
# or
pnpm add @zovo/webext-storage
```

## Quick Start

```ts
import { createStorage, defineSchema } from "@zovo/webext-storage";

// 1. Define your schema with default values
const schema = defineSchema({
  theme: "dark" as "dark" | "light",
  count: 0,
  enabled: true,
  tags: [] as string[],
  settings: { volume: 50 } as { volume: number },
});

// 2. Create a typed storage instance
const storage = createStorage({ schema, area: "local" });

// 3. Use it — fully typed!
await storage.set("theme", "light");     // OK
await storage.set("theme", "invalid");   // TS error
await storage.set("count", "oops");      // TS error + runtime TypeError

const theme = await storage.get("theme");  // type: "dark" | "light"
const count = await storage.get("count");  // type: number
```

## API Reference

### `defineSchema(schema)`

Identity function that provides type inference for your schema definition. Each key maps to its default value.

```ts
const schema = defineSchema({
  theme: "dark" as "dark" | "light",
  count: 0,
  enabled: true,
});
```

Use `as` assertions to narrow literal/union types. Without them, TypeScript infers the widest type (e.g., `string` instead of `"dark" | "light"`).

### `createStorage(options)`

Creates a typed storage instance.

| Option   | Type               | Default   | Description                        |
|----------|--------------------|-----------|------------------------------------|
| `schema` | `SchemaDefinition` | required  | Schema from `defineSchema()`       |
| `area`   | `"local" \| "sync"` | `"local"` | Chrome storage area to use         |

Returns a `TypedStorage<S>` instance.

### `TypedStorage<S>`

#### `storage.get(key)`

Get a single value. Returns the stored value, or the schema default if the key hasn't been set.

```ts
const theme = await storage.get("theme"); // "dark" (default)
```

#### `storage.getMany(keys)`

Get multiple values at once.

```ts
const { theme, count } = await storage.getMany(["theme", "count"]);
```

#### `storage.getAll()`

Get all schema keys and their values.

```ts
const all = await storage.getAll();
// { theme: "dark", count: 0, enabled: true, tags: [], settings: { volume: 50 } }
```

#### `storage.set(key, value)`

Set a single value. Validates the value type against the schema at runtime.

```ts
await storage.set("count", 42);      // OK
await storage.set("count", "hello"); // throws TypeError
```

#### `storage.setMany(items)`

Set multiple values at once. All values are validated before writing.

```ts
await storage.setMany({ theme: "light", count: 10 });
```

#### `storage.remove(key)`

Remove a single key. The next `get()` call returns the schema default.

```ts
await storage.remove("theme");
const theme = await storage.get("theme"); // "dark" (default)
```

#### `storage.removeMany(keys)`

Remove multiple keys at once.

```ts
await storage.removeMany(["theme", "count"]);
```

#### `storage.clear()`

Remove all schema-defined keys from storage.

```ts
await storage.clear();
```

#### `storage.watch(key, callback)`

Watch a key for changes. Returns an unsubscribe function.

```ts
const unwatch = storage.watch("theme", (newValue, oldValue) => {
  console.log(`Theme changed: ${oldValue} -> ${newValue}`);
});

// Later: stop watching
unwatch();
```

The callback receives `(newValue: T, oldValue: T | undefined)`. It only fires for changes in the matching storage area.

## Schema Validation

The wrapper validates at two levels:

1. **Compile-time** — TypeScript catches type mismatches in your editor.
2. **Runtime** — `set()` and `setMany()` throw `TypeError` if the value type doesn't match the schema default's type. Unknown keys throw `Error`.

```ts
await storage.set("count", "bad"); // TypeError: Key "count" expects type "number" but received "string".
await storage.get("unknown");      // Error: Unknown key "unknown". Valid keys: theme, count, enabled, ...
```

`null` is accepted for any key (useful for clearing values while keeping the key present).

## Sync vs Local

```ts
const local = createStorage({ schema, area: "local" });  // chrome.storage.local
const sync  = createStorage({ schema, area: "sync" });   // chrome.storage.sync
```

Sync storage has lower quotas but syncs across the user's devices. Local storage has higher limits but stays on the current device.

## Firefox / Polyfill Support

The library checks for both `chrome.storage` and `browser.storage` globals, so it works with Firefox WebExtensions and the `webextension-polyfill` library out of the box.

## Branding

**@zovo/webext-storage** is part of the [Zovo](https://zovo.one) open-source ecosystem — tools and libraries for building modern browser extensions.

## License

[MIT](./LICENSE)
