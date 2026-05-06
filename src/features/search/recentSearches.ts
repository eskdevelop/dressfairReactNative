import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'dressfair_recent_searches_v1';
const MAX_ENTRIES = 12;

// Device-resident search history. Persisting recent searches across launches
// is one of the small "this is not just a browser" signals we lean on for
// the App Store 4.2 review — it shows real native data ownership rather
// than a passthrough WebView.
export const recentSearches = {
  async list(): Promise<string[]> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter((entry): entry is string => typeof entry === 'string');
    } catch {
      return [];
    }
  },

  async add(term: string): Promise<string[]> {
    const trimmed = term.trim();
    if (trimmed.length === 0) return recentSearches.list();
    const current = await recentSearches.list();
    // Case-insensitive de-dupe so "Dress" and "dress" don't both pile up,
    // but preserve the user's original casing for display.
    const lower = trimmed.toLowerCase();
    const next = [
      trimmed,
      ...current.filter(entry => entry.toLowerCase() !== lower),
    ].slice(0, MAX_ENTRIES);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next;
  },

  async remove(term: string): Promise<string[]> {
    const current = await recentSearches.list();
    const next = current.filter(entry => entry !== term);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next;
  },

  async clear(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEY);
  },
};
