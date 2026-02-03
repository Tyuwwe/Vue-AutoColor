// MurmurHash3 implementation for text hashing
// Based on https://github.com/garycourt/murmurhash-js

export function murmurHash3(text: string): number {
  let h1 = 0xdeadbeef; // Seed value
  const c1 = 0xcc9e2d51;
  const c2 = 0x1b873593;
  const r1 = 15;
  const r2 = 13;
  const m = 5;
  const n = 0xe6546b64;

  let i = 0;
  const length = text.length;
  let k1 = 0;

  while (i < length) {
    const char = text.charCodeAt(i++);
    k1 = (k1 << 8) | char;
  }

  k1 = (k1 * c1) >>> 0;
  k1 = ((k1 << r1) | (k1 >>> (32 - r1))) >>> 0;
  k1 = (k1 * c2) >>> 0;

  h1 ^= k1;
  h1 = ((h1 << r2) | (h1 >>> (32 - r2))) >>> 0;
  h1 = (h1 * m + n) >>> 0;

  // Finalization
  h1 ^= length;
  h1 ^= h1 >>> 16;
  h1 = (h1 * 0x85ebca6b) >>> 0;
  h1 ^= h1 >>> 13;
  h1 = (h1 * 0xc2b2ae35) >>> 0;
  h1 ^= h1 >>> 16;

  return h1;
}

// Generate a hash from text
export function getTextHash(text: string): number {
  return murmurHash3(text);
}
