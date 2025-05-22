import { Observable } from "rxjs";
import { AppModel } from "src/app/core/domain/models/appModel.type";

export interface Storage<T extends AppModel & { _id: string }> { 
  getById(id: string, params?: any): Promise<T | null>;
  getById$?(id: string, params?: any): Observable<T | null>;

  getByField(field: string, value: string, params?: any): Promise<T[] | null>;
  getByField$?(field: string, value: string, params?: any): Observable<T[] | null>;

  getCollection?(params?: any): Promise<any[]>;
  getCollection$?(params?: any): Observable<any[]>;

  create(obj: T, params?: any): Promise<T | null>;
  update(obj: Partial<T> & { _id: string }, params?: any): Promise<T | null>;
  remove(id: string, params?: any): Promise<boolean>;
  exists(id: string, params?: any): Promise<boolean>;

  createInSubcollection?(obj: any, params?: any): Promise<any | null>;
  updateInSubcollection?(obj: Partial<any> & { _id: string }, params?: any): Promise<any | null>;

  query(params: any): Promise<T[] | null>;
  query$?(params: any): Observable<any[]>;
}