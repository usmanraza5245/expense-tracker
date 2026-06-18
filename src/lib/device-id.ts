import * as SecureStore from "expo-secure-store";

const KEY = "expense_device_id";

let cached: string | null = null;

/**
 * Returns a stable per-install identifier used to scope a user's expenses in
 * Firestore without requiring a login. Generated once and persisted in the
 * device keychain/keystore.
 */
export async function getDeviceId(): Promise<string> {
  if (cached) return cached;

  let id = await SecureStore.getItemAsync(KEY);
  if (!id) {
    id = `dev_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
    await SecureStore.setItemAsync(KEY, id);
  }

  cached = id;
  return id;
}
