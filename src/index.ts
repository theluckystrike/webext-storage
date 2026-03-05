/**
 * @zovo/webext-storage — Typed Chrome storage wrapper with schema validation.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A schema definition maps string keys to default values. */
export type SchemaDefinition = Record<string, unknown>;

/** Extract the TypeScript type of a schema's values. */
export type SchemaType<S extends SchemaDefinition> = {
  [K in keyof S]: S[K];
};

/** Storage area names supported by the Chrome storage API. */
export type AreaName = "local" | "sync";

/** Callback for storage change watchers. */
export type WatchCallback<T> = (newValue: T, oldValue: T | undefined) => void;

/** Handle returned by watch() — call to unsubscribe. */
export type Unwatch = () => void;

/** Options for creating a typed storage instance. */
export interface StorageOptions<S extends SchemaDefinition> {
  /** The schema that defines keys and their default values. */
  schema: S;
  /** Which storage area to use. Defaults to "local". */
  area?: AreaName;
}

// ---------------------------------------------------------------------------
// Schema helper
// ---------------------------------------------------------------------------

/**
 * Define a storage schema. This is an identity function that provides type
 * inference for your schema definition.
 *
 * @example
 * ```ts
 * const schema = defineSchema({
 *   theme: "dark" as "dark" | "light",
 *   count: 0,
 *   enabled: true,
 * });
 * ```
 */
export function defineSchema<S extends SchemaDefinition>(schema: S): S {
  return schema;
}

// ---------------------------------------------------------------------------
// Resolve the chrome.storage API (supports chrome & browser globals)
// ---------------------------------------------------------------------------

function getStorageArea(area: AreaName): chrome.storage.StorageArea {
  const root =
    typeof chrome !== "undefined" && chrome?.storage
      ? chrome.storage
      : typeof browser !== "undefined" && (browser as any)?.storage
        ? (browser as any).storage
        : undefined;

  if (!root) {
    throw new Error(
      "[@zovo/webext-storage] chrome.storage API is not available. " +
        "Are you running inside a browser extension context?",
    );
  }
  return root[area];
}

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

function validateKey<S extends SchemaDefinition>(
  schema: S,
  key: PropertyKey,
): asserts key is keyof S & string {
  if (!(key as string in schema)) {
    throw new Error(
      `[@zovo/webext-storage] Unknown key "${String(key)}". ` +
        `Valid keys: ${Object.keys(schema).join(", ")}`,
    );
  }
}

function validateType(key: string, value: unknown, expected: unknown): void {
  const expectedType = typeof expected;
  const actualType = typeof value;

  // Allow null — it's a valid storage value for any key.
  if (value === null) return;

  // For objects (including arrays), just check it's an object.
  if (expectedType === "object" && expected !== null) {
    if (actualType !== "object" || value === null) {
      throw new TypeError(
        `[@zovo/webext-storage] Key "${key}" expects an object but received ${actualType}.`,
      );
    }
    return;
  }

  if (actualType !== expectedType) {
    throw new TypeError(
      `[@zovo/webext-storage] Key "${key}" expects type "${expectedType}" but received "${actualType}".`,
    );
  }
}

// ---------------------------------------------------------------------------
// TypedStorage class
// ---------------------------------------------------------------------------

export class TypedStorage<S extends SchemaDefinition> {
  readonly schema: Readonly<S>;
  readonly area: AreaName;

  constructor(options: StorageOptions<S>) {
    this.schema = Object.freeze({ ...options.schema });
    this.area = options.area ?? "local";
  }

  // ---- get ----------------------------------------------------------------

  /** Get a single key. Returns the stored value or the schema default. */
  async get<K extends keyof S & string>(key: K): Promise<S[K]> {
    validateKey(this.schema, key);
    const storage = getStorageArea(this.area);
    const result = await storage.get({ [key]: this.schema[key] });
    return result[key] as S[K];
  }

  /** Get multiple keys. Returns an object with the requested values. */
  async getMany<K extends keyof S & string>(
    keys: K[],
  ): Promise<Pick<SchemaType<S>, K>> {
    for (const key of keys) validateKey(this.schema, key);
    const defaults: Record<string, unknown> = {};
    for (const key of keys) defaults[key] = this.schema[key];
    const storage = getStorageArea(this.area);
    const result = await storage.get(defaults);
    return result as Pick<SchemaType<S>, K>;
  }

  /** Get all keys defined in the schema. */
  async getAll(): Promise<SchemaType<S>> {
    const storage = getStorageArea(this.area);
    const result = await storage.get({ ...this.schema });
    return result as SchemaType<S>;
  }

  // ---- set ----------------------------------------------------------------

  /** Set a single key-value pair. Validates the value type against the schema. */
  async set<K extends keyof S & string>(key: K, value: S[K]): Promise<void> {
    validateKey(this.schema, key);
    validateType(key, value, this.schema[key]);
    const storage = getStorageArea(this.area);
    await storage.set({ [key]: value });
  }

  /** Set multiple key-value pairs at once. */
  async setMany(items: Partial<SchemaType<S>>): Promise<void> {
    for (const [key, value] of Object.entries(items)) {
      validateKey(this.schema, key);
      validateType(key, value, this.schema[key as keyof S]);
    }
    const storage = getStorageArea(this.area);
    await storage.set(items);
  }

  // ---- remove -------------------------------------------------------------

  /** Remove a single key from storage (reverts to schema default on next get). */
  async remove<K extends keyof S & string>(key: K): Promise<void> {
    validateKey(this.schema, key);
    const storage = getStorageArea(this.area);
    await storage.remove(key);
  }

  /** Remove multiple keys from storage. */
  async removeMany<K extends keyof S & string>(keys: K[]): Promise<void> {
    for (const key of keys) validateKey(this.schema, key);
    const storage = getStorageArea(this.area);
    await storage.remove(keys);
  }

  /** Remove all keys defined in the schema from storage. */
  async clear(): Promise<void> {
    const storage = getStorageArea(this.area);
    await storage.remove(Object.keys(this.schema));
  }

  // ---- watch --------------------------------------------------------------

  /**
   * Watch a specific key for changes.
   * Returns an unsubscribe function.
   */
  watch<K extends keyof S & string>(
    key: K,
    callback: WatchCallback<S[K]>,
  ): Unwatch {
    validateKey(this.schema, key);

    const listener = (
      changes: { [k: string]: chrome.storage.StorageChange },
      areaName: string,
    ) => {
      if (areaName !== this.area) return;
      if (!(key in changes)) return;
      const change = changes[key];
      callback(
        change.newValue as S[K],
        change.oldValue as S[K] | undefined,
      );
    };

    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Create a typed storage instance.
 *
 * @example
 * ```ts
 * import { createStorage, defineSchema } from "@zovo/webext-storage";
 *
 * const schema = defineSchema({
 *   theme: "dark" as "dark" | "light",
 *   count: 0,
 *   enabled: true,
 * });
 *
 * const storage = createStorage({ schema, area: "local" });
 *
 * await storage.set("theme", "light");
 * const theme = await storage.get("theme"); // "dark" | "light"
 * ```
 */
export function createStorage<S extends SchemaDefinition>(
  options: StorageOptions<S>,
): TypedStorage<S> {
  return new TypedStorage(options);
}
