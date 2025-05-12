import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'articleCharacteristicsTranslate'
})
export class ArticleCharacteristicsTranslatePipe implements PipeTransform {

  transform(value: string, ...args: unknown[]): string | null {
    const translations: Record<string, string> = {
      'category': 'Categoría',
      'type': 'Tipo',
      'brand': 'Marca',
      'model': 'Modelo',
      'color': 'Color',
      'fabricationYear': 'Año de fabricación',
      'serialNumber': 'Número de serie',
      'instrumentLevel': 'Nivel de instrumento',

      'format': 'Formato',
      'artist': 'Artista',
      'genre': 'Género',
      'recordingTitle': 'Título de la grabación',
      'year': 'Año',
      'duration': 'Duración',
      'label': 'Etiqueta',
      'catalogNumber': 'Número de catálogo',
      'isrc': 'ISRC',
      'barcode': 'Código de barras',
      'releaseDate': 'Fecha de publicación',
      'releaseCountry': 'País de publicación',
      'releaseFormat': 'Formato de publicación',
      'trackCount': 'Número de pistas',

      'name': 'Nombre',
      'accessories': 'Accesorios',
      'warranty': 'Garantía',
      'warrantyDuration': 'Duración de la garantía',
      'warrantyType': 'Tipo de garantía',

      'title': 'Título',
      'author': 'Autor',
      'theme': 'Tema',
      'edition': 'Edición',
      'publisher': 'Editorial',
      'pages': 'Páginas',
      'language': 'Idioma',
      'isbn': 'ISBN',
      'series': 'Serie',
      'volume': 'Volumen',

      'description': 'Descripción'
    };

    if (translations[value]) {
      return translations[value];
    }

    return '';
  }

}
