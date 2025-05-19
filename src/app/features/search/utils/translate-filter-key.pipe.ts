import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'translateFilterKey'
})
export class TranslateFilterKeyPipe implements PipeTransform {
  transform(value: string, ...args: unknown[]): string {
    const translations: Record<string, string> = {
      title: 'Título',
      category: 'Categoría',
      price: 'Precio',
      priceMin: 'Precio (min)',
      priceMax: 'Precio (max)',
      condition: 'Estado',
      orderBy: 'Ordenar por',
      type: 'Tipo',
      brand: 'Marca',
      instrumentLevel: 'Nivel',
      format: 'Formato',
      genre: 'Género',
      artist: 'Artista',
      theme: 'Tema',
    };
    
    return translations[value] || value;
  }
}
