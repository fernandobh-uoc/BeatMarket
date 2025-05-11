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
  //_id: string;
  //name: string;
  category: ArticleCategory;
  condition: ArticleCondition;
  characteristics: ArticleCharacteristics;
}

export function isArticleModel(obj: any): obj is ArticleModel {
  return typeof obj === 'object' &&
    obj !== null &&
    /* typeof obj._id === 'string' &&
    typeof obj.name === 'string' && */
    typeof obj.category === 'string' &&
    typeof obj.condition === 'string' &&
    typeof obj.characteristics === 'object';
}

/* class Article implements ArticleModel {
  //public _id: string = '';
  public name: string = '';
  public category: ArticleCategory = ArticleCategory.None;
  public condition: ArticleCondition = ArticleCondition.None;
  public characteristics: ArticleCharacteristics = { category: ArticleCategory.None }; 
  
  private constructor(product: Partial<ArticleModel> = {}) {
    Object.assign(this, { ...product });
  }

  static Build(product: Partial<ArticleModel> = {}): Article {
    return new Article(product);
  }

  public toJSON(): string {
    const serialized = Object.assign(this);
    delete serialized._id;
    try {
      const jsonStr = JSON.stringify(serialized);
      return jsonStr;
    } catch (error) {
      console.error(`Error stringifying object ${serialized}: ${error}`)
    }
    return '';
  }

  public fromJSON(json: string): Article | null {
    try {
      const obj = JSON.parse(json);
      return obj as Article;
    } catch (error) {
      console.error(`Error parsing json ${json}: ${error}`);
    }
    return null;
  }
} */