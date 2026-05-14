import xxhash from 'xxhash-wasm';

let hasherPromise: ReturnType<typeof xxhash> | null = null;

/**
 * Lazily initialises the xxhash WASM module once and caches the result.
 */
function getHasher() {
  if (!hasherPromise) {
    hasherPromise = xxhash();
  }
  return hasherPromise;
}

/**
 * Computes a 64-bit xxhash of `content` (any JSON-serialisable value)
 * and returns it as a hex string.
 */
export async function computeContentHash(content: unknown): Promise<string> {
  const hasher = await getHasher();
  const serialised = JSON.stringify(content);
  return hasher.h64ToString(serialised);
}
