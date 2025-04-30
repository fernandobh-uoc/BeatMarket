import { inject, Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Storage as NativeStorage } from '@ionic/storage-angular';

@Injectable({ providedIn: 'root' })
export class LocalStorageService {
  #storage: Storage | NativeStorage;
  #storageReady = false;

  constructor() {
    if (Capacitor.isNativePlatform()) {
      this.#storage = inject(NativeStorage);
      this.#initNativeStorage();
    } else {
      this.#storage = localStorage;
      this.#storageReady = true;
    }
  }

  async #initNativeStorage() {
    await this.#storage.create();
    this.#storageReady = true;
  }

  async get<T>(key: string): Promise<T | null> {
    let data = null;
    if (this.#storage instanceof NativeStorage) {
      if (!this.#storageReady) await this.#initNativeStorage();
      data = await this.#storage.get(key);
    }
    
    if (this.#storage instanceof Storage) {
      data = this.#storage.getItem(key);
    }

    if (data != null) {
      try {
        return JSON.parse(data) as T;
      } catch (error) {
        console.error(`Parsing error: ${error}`);
      }
    }

    return null;
  }

  async set(key: string, value: any): Promise<void> {
    if (this.#storage instanceof NativeStorage) {
      if (!this.#storageReady) await this.#initNativeStorage();
      this.#storage.set(key, JSON.stringify(value));
    }

    if (this.#storage instanceof Storage) {
      if (typeof value === 'string') {
        this.#storage.setItem(key, value);
      }
      this.#storage.setItem(key, JSON.stringify(value));
    }
  }

  async remove(key: string): Promise<void> {
    if (this.#storage instanceof NativeStorage) {
      if (!this.#storageReady) await this.#initNativeStorage();
      this.#storage.remove(key);
    }

    if (this.#storage instanceof Storage) {
      this.#storage.removeItem(key);
    }
  }

  async clear(): Promise<void> {
    this.#storage.clear();
  }
}