import stringify from "fast-json-stable-stringify";
import xxhash from "xxhash-wasm";


let hasher: Awaited<ReturnType<typeof xxhash>>;

export async function initHasher() {
  hasher = await xxhash();
}

export function hashUnitContent(content: unknown): string {
  if (!hasher) {
    throw new Error("Hasher not initialized");
  }

  const normalized = stringify(content);
  return hasher.h64(normalized).toString();
}