---
layout: default
title: webext-storage
---

# @theluckystrike/webext-storage

Typed Chrome and Firefox storage for extensions. Define your schema, get autocompletion and runtime validation.

[View on GitHub](https://github.com/theluckystrike/webext-storage)


GETTING STARTED

Install the package from npm.

    npm install @theluckystrike/webext-storage

Import defineSchema and createStorage into your extension code.

    import { defineSchema, createStorage } from "@theluckystrike/webext-storage";

Define a schema with your default values. The types are inferred from the defaults.

    const schema = defineSchema({
      theme: "dark" as "dark" | "light",
      fontSize: 14,
      enabled: true,
    });

    const storage = createStorage({ schema, area: "local" });

Read and write values with full type safety.

    const theme = await storage.get("theme");
    await storage.set("fontSize", 16);

Watch for storage changes in real time.

    const unwatch = storage.watch("theme", (newVal, oldVal) => {
      console.log(newVal);
    });


API REFERENCE

See the full [API docs](./api).


ABOUT

Part of the @zovo/webext toolkit by theluckystrike. Learn more at zovo.one.
