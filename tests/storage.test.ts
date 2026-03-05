import { describe, it, expect, vi, beforeEach } from "vitest";
import { defineSchema, createStorage, TypedStorage } from "../src/index";

// ---------------------------------------------------------------------------
// Mock chrome.storage
// ---------------------------------------------------------------------------

const store: Record<string, unknown> = {};

const mockStorageArea: chrome.storage.StorageArea = {
  get: vi.fn(async (keys: Record<string, unknown>) => {
    const result: Record<string, unknown> = {};
    for (const [k, defaultVal] of Object.entries(keys)) {
      result[k] = k in store ? store[k] : defaultVal;
    }
    return result;
  }),
  set: vi.fn(async (items: Record<string, unknown>) => {
    Object.assign(store, items);
  }),
  remove: vi.fn(async (keys: string | string[]) => {
    const arr = Array.isArray(keys) ? keys : [keys];
    for (const k of arr) delete store[k];
  }),
  clear: vi.fn(async () => {
    for (const k of Object.keys(store)) delete store[k];
  }),
  getBytesInUse: vi.fn(async () => 0),
  setAccessLevel: vi.fn(async () => {}),
  onChanged: { addListener: vi.fn(), removeListener: vi.fn(), hasListener: vi.fn(), hasListeners: vi.fn(), addRules: vi.fn(), getRules: vi.fn(), removeRules: vi.fn() } as any,
};

const listeners: Array<(changes: Record<string, chrome.storage.StorageChange>, areaName: string) => void> = [];

// Install global chrome mock
(globalThis as any).chrome = {
  storage: {
    local: mockStorageArea,
    sync: mockStorageArea,
    onChanged: {
      addListener: vi.fn((fn: any) => listeners.push(fn)),
      removeListener: vi.fn((fn: any) => {
        const idx = listeners.indexOf(fn);
        if (idx >= 0) listeners.splice(idx, 1);
      }),
    },
  },
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

const schema = defineSchema({
  theme: "dark" as "dark" | "light",
  count: 0,
  enabled: true,
  tags: [] as string[],
  settings: { volume: 50 } as { volume: number },
});

describe("defineSchema", () => {
  it("returns the same object passed in", () => {
    const s = defineSchema({ a: 1, b: "hello" });
    expect(s).toEqual({ a: 1, b: "hello" });
  });
});

describe("TypedStorage", () => {
  let storage: TypedStorage<typeof schema>;

  beforeEach(() => {
    // Clear the mock store
    for (const k of Object.keys(store)) delete store[k];
    vi.clearAllMocks();
    listeners.length = 0;
    storage = createStorage({ schema });
  });

  // --- get ---------------------------------------------------------------

  describe("get", () => {
    it("returns schema default when key is not in storage", async () => {
      const theme = await storage.get("theme");
      expect(theme).toBe("dark");
    });

    it("returns stored value when key exists", async () => {
      store.theme = "light";
      const theme = await storage.get("theme");
      expect(theme).toBe("light");
    });

    it("throws on unknown key", async () => {
      await expect((storage as any).get("unknown")).rejects.toThrow(
        'Unknown key "unknown"',
      );
    });
  });

  // --- getMany -----------------------------------------------------------

  describe("getMany", () => {
    it("returns multiple values with defaults", async () => {
      store.count = 42;
      const result = await storage.getMany(["theme", "count"]);
      expect(result).toEqual({ theme: "dark", count: 42 });
    });
  });

  // --- getAll ------------------------------------------------------------

  describe("getAll", () => {
    it("returns all schema keys with defaults", async () => {
      const result = await storage.getAll();
      expect(result).toEqual({
        theme: "dark",
        count: 0,
        enabled: true,
        tags: [],
        settings: { volume: 50 },
      });
    });
  });

  // --- set ---------------------------------------------------------------

  describe("set", () => {
    it("stores a value", async () => {
      await storage.set("count", 10);
      expect(store.count).toBe(10);
    });

    it("throws on type mismatch", async () => {
      await expect(
        (storage as any).set("count", "not a number"),
      ).rejects.toThrow("expects type");
    });

    it("allows null values", async () => {
      await storage.set("count", null as any);
      expect(store.count).toBeNull();
    });

    it("throws on unknown key", async () => {
      await expect((storage as any).set("nope", 1)).rejects.toThrow(
        'Unknown key "nope"',
      );
    });
  });

  // --- setMany -----------------------------------------------------------

  describe("setMany", () => {
    it("sets multiple values at once", async () => {
      await storage.setMany({ theme: "light", count: 5 });
      expect(store.theme).toBe("light");
      expect(store.count).toBe(5);
    });

    it("validates all values", async () => {
      await expect(
        storage.setMany({ count: "bad" as any }),
      ).rejects.toThrow("expects type");
    });
  });

  // --- remove ------------------------------------------------------------

  describe("remove", () => {
    it("removes a single key", async () => {
      store.theme = "light";
      await storage.remove("theme");
      expect(store.theme).toBeUndefined();
    });

    it("throws on unknown key", async () => {
      await expect((storage as any).remove("bad")).rejects.toThrow(
        'Unknown key "bad"',
      );
    });
  });

  // --- removeMany --------------------------------------------------------

  describe("removeMany", () => {
    it("removes multiple keys", async () => {
      store.theme = "light";
      store.count = 42;
      await storage.removeMany(["theme", "count"]);
      expect(store.theme).toBeUndefined();
      expect(store.count).toBeUndefined();
    });
  });

  // --- clear -------------------------------------------------------------

  describe("clear", () => {
    it("removes all schema keys", async () => {
      store.theme = "light";
      store.count = 42;
      await storage.clear();
      expect(mockStorageArea.remove).toHaveBeenCalledWith(
        Object.keys(schema),
      );
    });
  });

  // --- watch -------------------------------------------------------------

  describe("watch", () => {
    it("subscribes to changes for a key", () => {
      const cb = vi.fn();
      storage.watch("theme", cb);
      expect(chrome.storage.onChanged.addListener).toHaveBeenCalled();
    });

    it("calls callback when watched key changes", () => {
      const cb = vi.fn();
      storage.watch("theme", cb);
      const listener = listeners[0];
      listener(
        { theme: { newValue: "light", oldValue: "dark" } },
        "local",
      );
      expect(cb).toHaveBeenCalledWith("light", "dark");
    });

    it("ignores changes from other areas", () => {
      const cb = vi.fn();
      storage.watch("theme", cb);
      const listener = listeners[0];
      listener(
        { theme: { newValue: "light", oldValue: "dark" } },
        "sync",
      );
      expect(cb).not.toHaveBeenCalled();
    });

    it("ignores changes to other keys", () => {
      const cb = vi.fn();
      storage.watch("theme", cb);
      const listener = listeners[0];
      listener({ count: { newValue: 5 } }, "local");
      expect(cb).not.toHaveBeenCalled();
    });

    it("returns an unsubscribe function", () => {
      const cb = vi.fn();
      const unwatch = storage.watch("theme", cb);
      unwatch();
      expect(chrome.storage.onChanged.removeListener).toHaveBeenCalled();
    });
  });

  // --- area selection ----------------------------------------------------

  describe("area", () => {
    it("defaults to local", () => {
      expect(storage.area).toBe("local");
    });

    it("can be set to sync", () => {
      const syncStorage = createStorage({ schema, area: "sync" });
      expect(syncStorage.area).toBe("sync");
    });
  });

  // --- schema immutability -----------------------------------------------

  describe("schema", () => {
    it("schema is frozen", () => {
      expect(Object.isFrozen(storage.schema)).toBe(true);
    });
  });

  // --- object/array values -----------------------------------------------

  describe("complex values", () => {
    it("stores and retrieves arrays", async () => {
      await storage.set("tags", ["a", "b"]);
      store.tags = ["a", "b"];
      const tags = await storage.get("tags");
      expect(tags).toEqual(["a", "b"]);
    });

    it("stores and retrieves objects", async () => {
      await storage.set("settings", { volume: 80 });
      store.settings = { volume: 80 };
      const settings = await storage.get("settings");
      expect(settings).toEqual({ volume: 80 });
    });

    it("rejects non-object for object schema value", async () => {
      await expect(
        storage.set("settings", "bad" as any),
      ).rejects.toThrow("expects an object");
    });
  });
});
