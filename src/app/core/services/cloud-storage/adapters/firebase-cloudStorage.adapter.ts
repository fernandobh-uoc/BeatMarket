import { Injectable } from '@angular/core';
import { Storage as FirebaseStorage, getDownloadURL, ref, uploadBytes, deleteObject, getMetadata, listAll } from '@angular/fire/storage';
import { CloudStorage } from '../cloudStorage.interface';

@Injectable({ providedIn: 'root' })
export class FirebaseCloudStorageAdapter implements CloudStorage {
  constructor(private storage: FirebaseStorage) {}

  async upload(path: string, file: File | Blob, metadata: Record<string, any> = {}): Promise<string> {
    try {
      const storageRef = ref(this.storage, path);
      await uploadBytes(storageRef, file, metadata);
      return await getDownloadURL(storageRef);
    } catch (cloudStorageError) {
      throw cloudStorageError;
    }
  }

  async delete(path: string): Promise<void> {
    try {
      const storageRef = ref(this.storage, path);
      await deleteObject(storageRef);
    } catch (cloudStorageError) {
      throw cloudStorageError;
    }
  }

  async getDownloadURL(path: string): Promise<string> {
    try {
      const storageRef = ref(this.storage, path);
      return await getDownloadURL(storageRef);
    } catch (cloudStorageError) {
      throw cloudStorageError;
    }
  }

  async getMetadata(path: string): Promise<any> {
    try {
      const storageRef = ref(this.storage, path);
      return await getMetadata(storageRef);
    } catch (cloudStorageError) {
      throw cloudStorageError;
    }
  }

  async list(path: string): Promise<string[]> {
    try {
      const storageRef = ref(this.storage, path);
      const result = await listAll(storageRef);
      return result.items.map(item => item.name);
    } catch (cloudStorageError) {
      throw cloudStorageError;
    }
  }
}