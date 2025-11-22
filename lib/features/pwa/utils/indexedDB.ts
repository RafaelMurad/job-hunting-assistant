/**
 * IndexedDB Utilities
 *
 * Provides a simple wrapper around IndexedDB for offline data storage.
 *
 * LEARNING EXERCISE: Understand IndexedDB operations.
 */

const DB_NAME = "job-hunter-db";
const DB_VERSION = 1;

export interface StoredApplication {
  id: string;
  company: string;
  position: string;
  status: string;
  appliedAt: string;
  syncStatus: "synced" | "pending" | "error";
  updatedAt: string;
}

/**
 * TODO Exercise 2: Implement IndexedDB Operations
 *
 * IndexedDB is a low-level API for storing structured data.
 * Key concepts:
 * - Database contains object stores (like tables)
 * - Object stores contain records (like rows)
 * - Indexes allow efficient queries
 * - All operations are asynchronous
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
 */

/**
 * Open the database and create stores if needed
 */
export function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    // Called when database is created or version changes
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create applications store
      if (!db.objectStoreNames.contains("applications")) {
        const store = db.createObjectStore("applications", { keyPath: "id" });
        store.createIndex("status", "status", { unique: false });
        store.createIndex("syncStatus", "syncStatus", { unique: false });
      }

      // Create sync queue store
      if (!db.objectStoreNames.contains("syncQueue")) {
        db.createObjectStore("syncQueue", {
          keyPath: "id",
          autoIncrement: true,
        });
      }
    };
  });
}

/**
 * Get all records from a store
 */
export async function getAll<T>(storeName: string): Promise<T[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

/**
 * Get a single record by key
 */
export async function get<T>(storeName: string, key: string): Promise<T | undefined> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);
    const request = store.get(key);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

/**
 * Add or update a record
 */
export async function put<T>(storeName: string, record: T): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    const request = store.put(record);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Delete a record
 */
export async function remove(storeName: string, key: string): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    const request = store.delete(key);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Queue an operation for sync when back online
 */
export async function addToSyncQueue(operation: {
  type: "create" | "update" | "delete";
  storeName: string;
  data: unknown;
}): Promise<void> {
  await put("syncQueue", {
    ...operation,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  });
}

/**
 * Get all pending sync operations
 */
export async function getSyncQueue(): Promise<unknown[]> {
  return getAll("syncQueue");
}

/**
 * Clear processed sync operations
 */
export async function clearSyncQueue(): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("syncQueue", "readwrite");
    const store = transaction.objectStore("syncQueue");
    const request = store.clear();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}
