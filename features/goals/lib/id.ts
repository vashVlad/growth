export function makeId(): string {
  // Prefer built-in UUID if available
  const anyCrypto = globalThis.crypto as any;

  if (anyCrypto?.randomUUID) return anyCrypto.randomUUID();

  // Fallback: reasonably-unique ID (not cryptographic, but fine for local goals)
  return `g_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}
