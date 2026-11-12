import { useSyncExternalStore } from "react";
import { getStorageState, subscribeStorage, type StorageState } from "../storage/local";

export function useStorageState(): StorageState {
  return useSyncExternalStore(subscribeStorage, getStorageState, getStorageState);
}
