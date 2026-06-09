export interface PhotoRecord {
  id: string
  data: string
  createdAt: string
}

const DB_NAME = 'TotemPhotos'
const DB_VERSION = 2
const STORE_NAME = 'photos'

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

let _counter = Date.now()

function uid(): string {
  return `${_counter++}_${Math.random().toString(36).slice(2, 8)}`
}

export async function savePhoto(data: string): Promise<PhotoRecord> {
  const db = await openDb()
  const tx = db.transaction(STORE_NAME, 'readwrite')
  const store = tx.objectStore(STORE_NAME)
  const record: PhotoRecord = {
    id: uid(),
    data,
    createdAt: new Date().toISOString(),
  }
  return new Promise((resolve, reject) => {
    const req = store.add(record)
    req.onsuccess = () => {
      tx.commit()
      resolve(record)
    }
    req.onerror = () => {
      console.error('savePhoto error:', req.error)
      reject(req.error)
    }
  })
}

export async function getAllPhotos(): Promise<PhotoRecord[]> {
  const db = await openDb()
  const tx = db.transaction(STORE_NAME, 'readonly')
  const store = tx.objectStore(STORE_NAME)
  return new Promise((resolve, reject) => {
    const req = store.getAll()
    req.onsuccess = () => {
      const all: PhotoRecord[] = req.result
      all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      resolve(all)
    }
    req.onerror = () => {
      console.error('getAllPhotos error:', req.error)
      reject(req.error)
    }
  })
}

export async function deletePhoto(id: string): Promise<void> {
  const db = await openDb()
  const tx = db.transaction(STORE_NAME, 'readwrite')
  const store = tx.objectStore(STORE_NAME)
  return new Promise((resolve, reject) => {
    const req = store.delete(id)
    req.onsuccess = () => {
      tx.commit()
      resolve()
    }
    req.onerror = () => {
      console.error('deletePhoto error:', req.error)
      reject(req.error)
    }
  })
}
