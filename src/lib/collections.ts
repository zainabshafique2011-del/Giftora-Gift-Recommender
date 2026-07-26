import { useEffect, useState, useCallback } from "react";

export type Collection = {
  id: string;
  name: string;
  icon: string;
  createdAt: string;
};

export type SavedGift = {
  id: string;
  collectionId: string;
  name: string;
  description: string;
  priceRange: string;
  category: string;
  matchScore: number;
  occasion: string;
  emoji: string;
  /** Currency selected when the gift was saved (prices stay in this currency). */
  currency?: string;
  dateSaved: string;
};

const COL_KEY = "giftora:collections";
const GIFT_KEY = "giftora:gifts";

const DEFAULTS: Collection[] = [
  { id: "birthday", name: "Birthday", icon: "🎂", createdAt: new Date().toISOString() },
  { id: "anniversary", name: "Anniversary", icon: "❤️", createdAt: new Date().toISOString() },
  { id: "christmas", name: "Christmas", icon: "🎄", createdAt: new Date().toISOString() },
  { id: "baby-shower", name: "Baby Shower", icon: "👶", createdAt: new Date().toISOString() },
  { id: "graduation", name: "Graduation", icon: "🎓", createdAt: new Date().toISOString() },
  { id: "favorites", name: "Favorites", icon: "⭐", createdAt: new Date().toISOString() },
];

function safeRead<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeWrite(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent("giftora:storage"));
  } catch {
    // ignore
  }
}

export function getCollections(): Collection[] {
  const raw = safeRead<Collection[] | null>(COL_KEY, null);
  if (!raw) {
    safeWrite(COL_KEY, DEFAULTS);
    return DEFAULTS;
  }
  return raw;
}

export function getGifts(): SavedGift[] {
  return safeRead<SavedGift[]>(GIFT_KEY, []);
}

export function saveCollections(cols: Collection[]) {
  safeWrite(COL_KEY, cols);
}

export function saveGifts(gifts: SavedGift[]) {
  safeWrite(GIFT_KEY, gifts);
}

export function createCollection(name: string, icon = "🎁"): Collection {
  const cols = getCollections();
  const id = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Math.random().toString(36).slice(2, 6)}`;
  const col: Collection = { id, name, icon, createdAt: new Date().toISOString() };
  saveCollections([...cols, col]);
  return col;
}

export function deleteCollection(id: string) {
  saveCollections(getCollections().filter((c) => c.id !== id));
  saveGifts(getGifts().filter((g) => g.collectionId !== id));
}

export function addGift(gift: Omit<SavedGift, "id" | "dateSaved">): SavedGift {
  const full: SavedGift = {
    ...gift,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    dateSaved: new Date().toISOString(),
  };
  saveGifts([full, ...getGifts()]);
  return full;
}

export function removeGift(id: string) {
  saveGifts(getGifts().filter((g) => g.id !== id));
}

export function moveGift(id: string, collectionId: string) {
  saveGifts(getGifts().map((g) => (g.id === id ? { ...g, collectionId } : g)));
}

/** Hook returning collections + gifts, live-updated on writes and cross-tab. */
export function useCollectionsStore() {
  const isClient = typeof window !== "undefined";
  const [collections, setCollections] = useState<Collection[]>(() =>
    isClient ? getCollections() : [],
  );
  const [gifts, setGifts] = useState<SavedGift[]>(() =>
    isClient ? getGifts() : [],
  );
  const [ready, setReady] = useState<boolean>(isClient);

  const refresh = useCallback(() => {
    setCollections(getCollections());
    setGifts(getGifts());
  }, []);

  useEffect(() => {
    refresh();
    setReady(true);
    const onChange = () => refresh();
    window.addEventListener("giftora:storage", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("giftora:storage", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, [refresh]);

  return { collections, gifts, ready, refresh };
}
