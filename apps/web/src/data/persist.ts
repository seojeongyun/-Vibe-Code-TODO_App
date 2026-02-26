export async function isStoragePersisted(): Promise<boolean | null> {
  if (!('storage' in navigator) || !navigator.storage.persisted) {
    return null;
  }
  return navigator.storage.persisted();
}

export async function requestPersistentStorage(): Promise<boolean | null> {
  if (!('storage' in navigator) || !navigator.storage.persist) {
    return null;
  }
  return navigator.storage.persist();
}
