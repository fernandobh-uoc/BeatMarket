import { JSONSerializable } from "../../interfaces/jsonserializable.interface";

import { ArticleCharacteristics } from "./articleCharacteristics.interface";

export enum ArticleCategory {
  None = '',
  Instruments = 'Instrumentos',
  Recordings = 'Grabaciones',
  Accessories = 'Accesorios',
  Professional = 'Profesional',
  Books = 'Libros',
  Other = 'Otros'
}

export enum ArticleCondition {
  None = '',
  New = 'Nuevo',
  Good = 'Bueno',
  Used = 'Usado',
  Bad = 'Malo',
  Refurbished = 'Restaurado'
}

export interface ArticleModel {
  category: ArticleCategory;
  condition: ArticleCondition;
  characteristics: ArticleCharacteristics;
}

export function isArticleModel(obj: any): obj is ArticleModel {
  return typeof obj === 'object' &&
    obj !== null &&
    typeof obj.category === 'string' &&
    typeof obj.condition === 'string' &&
    typeof obj.characteristics === 'object';
}