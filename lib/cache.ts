import { info } from "@lib/log";
import { mkdir, readFile, rename, writeFile } from "fs/promises";

const CACHE_DIR = "./.cache";

/**
 * Fetches data using the provided function, with file-based caching support.
 * Mostly useful during development to avoid constantly re-fetching from the API.
 *
 * @param cacheKey - Unique key used as the cache filename
 * @param fetchFn - Async function that fetches the data when cache misses
 * @param force - If true, bypasses the cache and re-fetches
 * @returns The fetched (or cached) data
 */
export default async function fetchWithCache<T>(
  cacheKey: string,
  fetchFn: () => Promise<T>,
  force = false,
): Promise<T> {
  if (!/^[A-Za-z0-9._-]+$/.test(cacheKey)) {
    throw new Error(`Invalid cache key: "${cacheKey}"`);
  }
  const dataFile = `${CACHE_DIR}/${cacheKey}.json`;
  await mkdir(CACHE_DIR, { recursive: true });

  if (!force) {
    try {
      const content = await readFile(dataFile, "utf-8");
      if (content) {
        info("Using cached data from", dataFile);
        return JSON.parse(content) as T;
      }
    } catch {
      // Cache miss — fall through to fetch
    }
  }

  const data = await fetchFn();
  const tmpFile = `${dataFile}.tmp`;
  await writeFile(tmpFile, JSON.stringify(data, null, 2), "utf-8");
  await rename(tmpFile, dataFile);
  return data;
}
