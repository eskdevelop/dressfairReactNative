import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY_V1 = 'dressfair_recent_searches_v1';
const STORAGE_KEY_V2 = 'dressfair_recent_searches_v2';
const MAX_ENTRIES = 12;

export type RecentSearchEntry = {
  query: string;
  /** CDN-relative path when the API returns a path (not `http`/`https`). */
  thumbRelativePath?: string | null;
};

function isV1StringArray(parsed: unknown): parsed is string[] {
  return Array.isArray(parsed) && parsed.every((x): x is string => typeof x === 'string');
}

function normalizeV2(parsed: unknown): RecentSearchEntry[] {
  if (!Array.isArray(parsed)) return [];
  const out: RecentSearchEntry[] = [];
  for (const row of parsed) {
    if (!row || typeof row !== 'object') continue;
    const r = row as Record<string, unknown>;
    const q = typeof r.query === 'string' ? r.query.trim() : '';
    if (q.length === 0) continue;
    const tr = r.thumbRelativePath;
    const thumbRelativePath =
      tr === null || tr === undefined
        ? null
        : typeof tr === 'string' && tr.trim().length > 0
          ? tr.trim()
          : null;
    out.push({ query: q, thumbRelativePath });
  }
  return out;
}

// Device-resident search history. Persisting recent searches across launches
// is one of the small "this is not just a browser" signals we lean on for
// the App Store 4.2 review — it shows real native data ownership rather
// than a passthrough WebView.
export const recentSearches = {
  async list(): Promise<RecentSearchEntry[]> {
    try {
      const v2raw = await AsyncStorage.getItem(STORAGE_KEY_V2);
      if (v2raw) {
        return normalizeV2(JSON.parse(v2raw));
      }
      const v1raw = await AsyncStorage.getItem(STORAGE_KEY_V1);
      if (!v1raw) return [];
      const parsed: unknown = JSON.parse(v1raw);
      if (isV1StringArray(parsed)) {
        const migrated: RecentSearchEntry[] = parsed.map(query => ({
          query,
          thumbRelativePath: null,
        }));
        await AsyncStorage.setItem(STORAGE_KEY_V2, JSON.stringify(migrated));
        await AsyncStorage.removeItem(STORAGE_KEY_V1);
        return migrated;
      }
      return [];
    } catch {
      return [];
    }
  },

  async add(
    term: string,
    options?: { thumbRelativePath?: string | null },
  ): Promise<RecentSearchEntry[]> {
    const trimmed = term.trim();
    if (trimmed.length === 0) return recentSearches.list();
    const current = await recentSearches.list();
    const lower = trimmed.toLowerCase();
    const thumb = options?.thumbRelativePath ?? null;
    const next: RecentSearchEntry[] = [
      { query: trimmed, thumbRelativePath: thumb },
      ...current.filter(e => e.query.toLowerCase() !== lower),
    ].slice(0, MAX_ENTRIES);
    await AsyncStorage.setItem(STORAGE_KEY_V2, JSON.stringify(next));
    return next;
  },

  async remove(term: string): Promise<RecentSearchEntry[]> {
    const current = await recentSearches.list();
    const next = current.filter(e => e.query !== term);
    await AsyncStorage.setItem(STORAGE_KEY_V2, JSON.stringify(next));
    return next;
  },

  async clear(): Promise<void> {
    await AsyncStorage.multiRemove([STORAGE_KEY_V1, STORAGE_KEY_V2]);
  },
};
