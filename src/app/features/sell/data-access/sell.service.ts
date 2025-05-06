import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SellService {

  imagesDataURLs = signal<string[]>([]);

  constructor() { }

  uploadImages = async (): Promise<string[]> => {
    return [];
  }

  uploadImagesNotNative = async (event: any): Promise<void> => {
    const input = event.target as HTMLInputElement;

    if (!input.files) return;

    const files = Array.from(input.files);
    const promises = files.map(file => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        resolve(dataUrl);
      };
      reader.onerror = () => {
        reject(new Error('Error al leer el archivo'));
      };
      reader.readAsDataURL(file);
    }))

    try {
      const imageDataURLs = await Promise.all(promises);
      this.imagesDataURLs.set([...imageDataURLs as string[]]);
    } catch (error) {
      console.error(error);
    }
  }
}
