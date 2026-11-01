/// <reference types="vitest/globals" />
// Test setup — runs before every test file
import '@testing-library/jest-dom';

// In-memory mock for localStorage in test environment
class LocalStorageMock implements Storage {
  private store = new Map<string, string>();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  key(index: number): string | null {
    const keys = Array.from(this.store.keys());
    return keys[index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
}

if (typeof window !== 'undefined') {
  if (!window.localStorage || typeof window.localStorage.setItem !== 'function') {
    Object.defineProperty(window, 'localStorage', {
      value: new LocalStorageMock(),
      writable: true,
    });
  }
}

if (typeof globalThis !== 'undefined') {
  if (!globalThis.localStorage || typeof globalThis.localStorage.setItem !== 'function') {
    Object.defineProperty(globalThis, 'localStorage', {
      value: new LocalStorageMock(),
      writable: true,
    });
  }
}
