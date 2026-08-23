"use client";

import { api } from "./api";

/**
 * Offline-first whisper outbox backed by IndexedDB.
 *
 * When the device is offline (or a network submit fails), the whisper is
 * stored locally and auto-synced to the server as soon as connectivity
 * returns. This is what makes WhisperLag usable on campus where connectivity
 * drops — your proposal's "offline-first surveys" promise, now real.
 */

const DB_NAME = "whisperlag";
const STORE = "outbox";

interface QueuedWhisper {
  id: string;
  payload: { category: string; content: string; unilagEmail?: string };
  createdAt: string;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) {
        req.result.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function queueWhisper(payload: QueuedWhisper["payload"]): Promise<void> {
  const db = await openDb();
  const tx = db.transaction(STORE, "readwrite");
  tx.objectStore(STORE).put({
    id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    payload,
    createdAt: new Date().toISOString(),
  });
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

async function listPending(): Promise<QueuedWhisper[]> {
  const db = await openDb();
  const tx = db.transaction(STORE, "readonly");
  const items = await new Promise<QueuedWhisper[]>((resolve, reject) => {
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => resolve((req.result as QueuedWhisper[]) ?? []);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return items;
}

async function removeQueued(id: string): Promise<void> {
  const db = await openDb();
  const tx = db.transaction(STORE, "readwrite");
  tx.objectStore(STORE).delete(id);
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

/** Returns the number of whispers synced. Call it when the connection returns. */
export async function flushOutbox(): Promise<number> {
  const pending = await listPending();
  let synced = 0;
  for (const item of pending) {
    try {
      await api("/feedback/public", {
        method: "POST",
        body: JSON.stringify(item.payload),
      });
      await removeQueued(item.id);
      synced += 1;
    } catch {
      // Leave it queued; retry on the next connectivity change.
    }
  }
  return synced;
}

/** Tries to submit now; if offline/network fails, queues it for later. */
export async function submitWhisperOfflineAware(payload: QueuedWhisper["payload"]): Promise<{
  mode: "online" | "queued";
}> {
  if (navigator.onLine) {
    try {
      await api("/feedback/public", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return { mode: "online" };
    } catch {
      // Network failed mid-request — fall through to the queue.
    }
  }
  await queueWhisper(payload);
  return { mode: "queued" };
}

export async function queuedCount(): Promise<number> {
  const pending = await listPending();
  return pending.length;
}