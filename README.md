[![CI](https://github.com/theluckystrike/webext-storage/actions/workflows/ci.yml/badge.svg)](https://github.com/theluckystrike/webext-storage/actions)
[![npm](https://img.shields.io/npm/v/@theluckystrike/webext-storage)](https://www.npmjs.com/package/@theluckystrike/webext-storage)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)

# @theluckystrike/webext-storage

A typed wrapper around the Chrome and Firefox storage API. Define your schema once, get full TypeScript autocompletion and runtime validation everywhere.

Works with chrome.storage (Manifest V3) and browser.storage (Firefox / webextension-polyfill).


INSTALL

npm install @theluckystrike/webext-storage


QUICK START

import { defineSchema, createStorage } from "@theluckystrike/webext-storage";

const schema = defineSchema({
  theme: "dark" as "dark" | "light",
  fontSize: 14,
  enabled: true,
});

const storage = createStorage({ schema, area: "local" });

// Read a value (returns the schema default if unset)
const theme = await storage.get("theme");

// Write a value (type-checked against your schema)
await storage.set("fontSize", 16);

// Watch for changes
const unwatch = storage.watch("theme", (newVal, oldVal) => {
  console.log("theme changed", oldVal, "->", newVal);
});


API

defineSchema(schema)

Identity function that locks in your literal types. Pass your defaults object through this before handing it to createStorage.

  const schema = defineSchema({
    theme: "dark" as "dark" | "light",
    count: 0,
    tags: [] as string[],
  });


createStorage(options)

Returns a TypedStorage instance. Options:

  schema    Your schema object (required)
  area      "local" or "sync" (defaults to "local")


TypedStorage Methods

  get(key)                Returns the stored value, or the schema default
  getMany(keys)           Returns an object with values for the given keys
  getAll()                Returns all schema keys and their values
  set(key, value)         Stores a value (validated at runtime)
  setMany(items)          Stores multiple values at once
  remove(key)             Removes a key from storage
  removeMany(keys)        Removes multiple keys
  clear()                 Removes all schema-defined keys
  watch(key, callback)    Watches a key for changes, returns an unwatch function

All read and write methods are async and return Promises.


VALIDATION

The library validates at two levels. At compile time, TypeScript will reject any key or value that does not match your schema. At runtime, set and setMany check the typeof each value against the schema default and throw a TypeError on mismatch. Null is accepted for any key.


SYNC VS LOCAL

Use area "local" for data that stays on the current device. Use area "sync" for data that follows the user across signed-in browsers. The sync area has lower size limits, so keep payloads small.


FIREFOX AND POLYFILLS

The library checks for chrome.storage first, then falls back to browser.storage. If you use webextension-polyfill, everything works out of the box.


LICENSE

MIT


ABOUT

Part of the @zovo/webext toolkit. Built by theluckystrike at zovo.one, a studio for Chrome extensions and browser tools.

https://github.com/theluckystrike/webext-storage


Part of the **[Chrome Extension Toolkit](https://github.com/theluckystrike/chrome-extension-toolkit)** by theluckystrike. See all templates, packages, and guides at [github.com/theluckystrike/chrome-extension-toolkit](https://github.com/theluckystrike/chrome-extension-toolkit).

## License

MIT
