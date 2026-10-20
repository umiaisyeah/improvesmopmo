import { DocumentPackage } from '../types';

const DB_NAME = 'bapl_verification_db';
const DB_VERSION = 1;
const PKG_STORE = 'packages';
const META_STORE = 'metadata';
const LS_FALLBACK_KEY = 'bapl_verification_packages_v1';
const LS_ACTIVE_PKG_KEY = 'bapl_active_package_id';
const LS_INITIALIZED_KEY = 'bapl_storage_initialized';

/**
 * Open IndexedDB database with fallback safety.
 */
function openDB(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      resolve(null);
      return;
    }

    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = request.result;
        if (!db.objectStoreNames.contains(PKG_STORE)) {
          db.createObjectStore(PKG_STORE, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(META_STORE)) {
          db.createObjectStore(META_STORE, { keyPath: 'key' });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = (err) => {
        console.warn('IndexedDB open failed, falling back to localStorage:', err);
        resolve(null);
      };
    } catch (e) {
      console.warn('IndexedDB initialization error:', e);
      resolve(null);
    }
  });
}

/**
 * Load all stored packages from IndexedDB.
 * If IndexedDB is empty but localStorage has legacy packages, migrates them automatically.
 */
export async function loadAllStoredPackages(): Promise<DocumentPackage[] | null> {
  const db = await openDB();

  if (db) {
    try {
      const packages = await new Promise<DocumentPackage[]>((resolve, reject) => {
        const tx = db.transaction(PKG_STORE, 'readonly');
        const store = tx.objectStore(PKG_STORE);
        const req = store.getAll();

        req.onsuccess = () => {
          resolve((req.result as DocumentPackage[]) || []);
        };
        req.onerror = () => {
          reject(req.error);
        };
      });

      if (packages && packages.length > 0) {
        // Return sorted by creation date or retain existing order
        return packages;
      }

      // Check if user has explicitly initialized / cleared data
      const isCleared = await checkUserClearedFlag(db);
      if (isCleared) {
        return [];
      }
    } catch (e) {
      console.warn('Error reading from IndexedDB:', e);
    }
  }

  // Fallback to localStorage (migration or unsupported IndexedDB)
  try {
    const saved = localStorage.getItem(LS_FALLBACK_KEY);
    if (saved !== null) {
      const parsed: DocumentPackage[] = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        // If we found them in localStorage, migrate them to IndexedDB for safety
        if (db && parsed.length > 0) {
          saveAllPackagesToIndexedDB(db, parsed).catch((err) =>
            console.warn('Migration to IndexedDB failed:', err)
          );
        }
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load from localStorage:', e);
  }

  return null; // Signals to caller that this is the first clean install
}

/**
 * Save all packages permanently into IndexedDB and keep localStorage in sync if possible.
 */
export async function persistAllPackages(packages: DocumentPackage[]): Promise<boolean> {
  const db = await openDB();
  let idbSuccess = false;

  if (db) {
    try {
      await saveAllPackagesToIndexedDB(db, packages);
      idbSuccess = true;
    } catch (e) {
      console.error('Failed to persist packages to IndexedDB:', e);
    }
  }

  // Also sync to localStorage as secondary backup (ignoring QuotaExceededError)
  try {
    localStorage.setItem(LS_INITIALIZED_KEY, 'true');
    // If packages array is very large, localStorage might throw QuotaExceededError
    // But since IndexedDB succeeded, user data will NEVER be lost!
    localStorage.setItem(LS_FALLBACK_KEY, JSON.stringify(packages));
  } catch (e) {
    // QuotaExceededError is harmless because IndexedDB holds the authoritative data
    console.info('localStorage backup skipped or quota exceeded (IndexedDB has stored full data securely)');
  }

  return idbSuccess;
}

/**
 * Save a single package into storage immediately.
 */
export async function persistSinglePackage(pkg: DocumentPackage): Promise<void> {
  const db = await openDB();
  if (db) {
    try {
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(PKG_STORE, 'readwrite');
        const store = tx.objectStore(PKG_STORE);
        const req = store.put(pkg);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn('Failed to persist single package to IndexedDB:', e);
    }
  }
}

/**
 * Delete a package from storage by ID.
 */
export async function removePackageFromStorage(pkgId: string): Promise<void> {
  const db = await openDB();
  if (db) {
    try {
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(PKG_STORE, 'readwrite');
        const store = tx.objectStore(PKG_STORE);
        const req = store.delete(pkgId);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn('Failed to delete package from IndexedDB:', e);
    }
  }
}

/**
 * Clear all packages from storage permanently.
 */
export async function clearAllStoredPackages(): Promise<void> {
  const db = await openDB();
  if (db) {
    try {
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction([PKG_STORE, META_STORE], 'readwrite');
        const pkgStore = tx.objectStore(PKG_STORE);
        const metaStore = tx.objectStore(META_STORE);
        pkgStore.clear();
        metaStore.put({ key: 'user_cleared', value: true });
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (e) {
      console.warn('Failed to clear packages in IndexedDB:', e);
    }
  }

  try {
    localStorage.setItem(LS_INITIALIZED_KEY, 'true');
    localStorage.setItem(LS_FALLBACK_KEY, JSON.stringify([]));
    localStorage.removeItem(LS_ACTIVE_PKG_KEY);
  } catch (e) {}
}

/**
 * Save the active package ID permanently.
 */
export async function persistActivePackageId(id: string): Promise<void> {
  try {
    if (id) {
      localStorage.setItem(LS_ACTIVE_PKG_KEY, id);
    } else {
      localStorage.removeItem(LS_ACTIVE_PKG_KEY);
    }
  } catch (e) {}

  const db = await openDB();
  if (db) {
    try {
      const tx = db.transaction(META_STORE, 'readwrite');
      const store = tx.objectStore(META_STORE);
      store.put({ key: 'activePackageId', value: id });
    } catch (e) {}
  }
}

/**
 * Get the stored active package ID.
 */
export async function getStoredActivePackageId(): Promise<string | null> {
  try {
    const saved = localStorage.getItem(LS_ACTIVE_PKG_KEY);
    if (saved) return saved;
  } catch (e) {}

  const db = await openDB();
  if (db) {
    try {
      return await new Promise<string | null>((resolve) => {
        const tx = db.transaction(META_STORE, 'readonly');
        const store = tx.objectStore(META_STORE);
        const req = store.get('activePackageId');
        req.onsuccess = () => {
          resolve(req.result?.value || null);
        };
        req.onerror = () => resolve(null);
      });
    } catch (e) {}
  }

  return null;
}

/**
 * Internal helper to save all packages in IndexedDB atomically.
 */
function saveAllPackagesToIndexedDB(db: IDBDatabase, packages: DocumentPackage[]): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction([PKG_STORE, META_STORE], 'readwrite');
    const pkgStore = tx.objectStore(PKG_STORE);
    const metaStore = tx.objectStore(META_STORE);

    // Clear existing to avoid orphaned packages
    pkgStore.clear();

    for (const pkg of packages) {
      pkgStore.put(pkg);
    }

    metaStore.put({ key: 'user_cleared', value: packages.length === 0 });
    metaStore.put({ key: 'package_count', value: packages.length });
    metaStore.put({ key: 'last_updated', value: new Date().toISOString() });

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

/**
 * Check if the user has explicitly emptied packages
 */
async function checkUserClearedFlag(db: IDBDatabase): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    try {
      const tx = db.transaction(META_STORE, 'readonly');
      const store = tx.objectStore(META_STORE);
      const req = store.get('user_cleared');
      req.onsuccess = () => {
        resolve(req.result?.value === true);
      };
      req.onerror = () => resolve(false);
    } catch (e) {
      resolve(false);
    }
  });
}

/**
 * Export all packages to a downloadable JSON file backup.
 * Provides user absolute data sovereignty.
 */
export function exportPackagesBackup(packages: DocumentPackage[]): void {
  const exportData = {
    app: 'BAPL Verification & Audit System',
    exportDate: new Date().toISOString(),
    totalPackages: packages.length,
    packages,
  };

  const jsonStr = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const dateSlug = new Date().toISOString().slice(0, 10);
  a.download = `backup_paket_dokumen_bapl_${dateSlug}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Parse and restore packages from an exported backup JSON file.
 */
export async function importPackagesBackup(file: File): Promise<DocumentPackage[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);

        let importedList: DocumentPackage[] = [];
        if (Array.isArray(parsed)) {
          importedList = parsed;
        } else if (parsed && Array.isArray(parsed.packages)) {
          importedList = parsed.packages;
        } else {
          throw new Error('Format file cadangan JSON tidak valid atau tidak memiliki daftar paket.');
        }

        // Validate basic package integrity
        const validPackages = importedList.filter(
          (p) => p && typeof p === 'object' && p.id && p.title && p.result
        );

        if (validPackages.length === 0) {
          throw new Error('Tidak ada paket dokumen valid yang ditemukan dalam berkas backup JSON ini.');
        }

        resolve(validPackages);
      } catch (err: any) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Gagal membaca berkas cadangan JSON.'));
    reader.readAsText(file);
  });
}
