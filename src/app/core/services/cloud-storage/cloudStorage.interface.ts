import { InjectionToken } from "@angular/core";

export const CloudStorage = new InjectionToken<CloudStorage>('CloudStorage');

export interface CloudStorage {
  upload(path: string, file: File | Blob, metadata?: Record<string, any>): Promise<string>; // returns download URL
  delete(path: string): Promise<void>;
  getDownloadURL(path: string): Promise<string>;
  getMetadata(path: string): Promise<any>;
  list(path: string): Promise<string[]>; // returns list of file names
}