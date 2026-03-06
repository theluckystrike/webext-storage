---
layout: default
title: API Reference
---

# API Reference


defineSchema(schema)

Identity function for type inference. Pass your defaults object through this so TypeScript narrows the literal types.

    const schema = defineSchema({
      theme: "dark" as "dark" | "light",
      count: 0,
    });

Returns the same object you pass in, with narrowed types.


createStorage(options)

Creates a TypedStorage instance bound to a storage area.

    const storage = createStorage({
      schema: mySchema,
      area: "local",   // or "sync"
    });

Options

    schema    Required. Your schema object from defineSchema.
    area      Optional. "local" (default) or "sync".


TypedStorage

The object returned by createStorage. All methods are async unless noted.

get(key)
Returns the value for the given key. If the key has never been set, returns the schema default.

    const theme = await storage.get("theme"); // "dark"

getMany(keys)
Returns an object with values for the specified keys.

    const { theme, fontSize } = await storage.getMany(["theme", "fontSize"]);

getAll()
Returns all schema keys and their stored values.

set(key, value)
Stores a single value. Throws TypeError if the value type does not match the schema.

    await storage.set("fontSize", 16);

setMany(items)
Stores multiple values. Validates all values before writing.

    await storage.setMany({ theme: "light", fontSize: 18 });

remove(key)
Removes a key from storage. Future reads will return the schema default.

removeMany(keys)
Removes multiple keys.

clear()
Removes all schema-defined keys from storage.

watch(key, callback)
Registers a listener for changes to a specific key. The callback receives the new value and the old value. Returns an unwatch function.

    const stop = storage.watch("theme", (next, prev) => {
      console.log(prev, "->", next);
    });

    // Later
    stop();


Properties

    storage.schema    Frozen copy of the original schema
    storage.area      The storage area ("local" or "sync")


Back to [home](./).
