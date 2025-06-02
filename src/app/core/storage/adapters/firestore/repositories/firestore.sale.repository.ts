import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs/internal/Observable";

import { SaleRepository } from "../../../../domain/repositories/sale.repository";
import { FirestoreAdapter } from "../firestore.adapter";
import { SaleModel, Sale } from "../../../../domain/models/sale.model";
import { FirestoreSaleConverter } from "../converters/firestore.sale.converter";

@Injectable({ providedIn: 'root' })
export class FirestoreSaleRepository implements SaleRepository {
  private firestore: FirestoreAdapter<Sale> = inject(FirestoreAdapter<SaleModel>);
  private saleConverter: FirestoreSaleConverter = new FirestoreSaleConverter();

  async getSaleById(id: string): Promise<Sale | null> {
    try {
      return await this.firestore.getById(id, { collection: 'sales' });
    } catch (firestoreError) {
      console.error(firestoreError);
      throw firestoreError;
    }
  }

  getSaleById$(id: string): Observable<Sale | null> | null {
    try {
      return this.firestore.getById$(id, { collection: 'sales' });
    } catch (firestoreError) {
      console.error(firestoreError);
      throw firestoreError;
    }
  }

  async getSalesByBuyerId(userId: string): Promise<Sale[] | null> {
    try {
      const sales: Sale[] | null = await this.firestore.query({
        collection: 'sales',
        converter: this.saleConverter,
        queryConstraints: {
          filters: [{ field: 'buyerData.userId', operator: '==', value: userId }], 
          orderBy: { field: 'createdAt', direction: 'desc' }, 
        }
      });
      return sales;
    } catch (firestoreError) {
      console.error(firestoreError);
      throw firestoreError;
    }
  }

  getSalesByBuyerId$(userId: string): Observable<Sale[] | null> | null {
    try {
      const sales$: Observable<Sale[] | null> | null = this.firestore.query$({
        collection: 'sales',
        converter: this.saleConverter,
        queryConstraints: {
          filters: [{ field: 'buyerData.userId', operator: '==', value: userId }], 
          orderBy: { field: 'createdAt', direction: 'desc' }, 
        }
      });

      return sales$;
    } catch (firestoreError) {
      console.error(firestoreError);
      throw firestoreError;
    }
  }

  async getSalesByBuyerUsername(username: string): Promise<Sale[] | null> {
    try {
      const sales: Sale[] | null = await this.firestore.query({
        collection: 'sales',
        converter: this.saleConverter,
        queryConstraints: {
          filters: [{ field: 'buyerData.username', operator: '==', value: username }], 
          orderBy: { field: 'createdAt', direction: 'desc' }, 
        }
      });
      return sales;
    } catch (firestoreError) {
      console.error(firestoreError);
      throw firestoreError;
    }
  }

  getSalesByBuyerUsername$(username: string): Observable<Sale[] | null> | null {
    try {
      const sales$: Observable<Sale[] | null> | null = this.firestore.query$({
        collection: 'sales',
        converter: this.saleConverter,
        queryConstraints: {
          filters: [{ field: 'buyerData.username', operator: '==', value: username }], 
          orderBy: { field: 'createdAt', direction: 'desc' }, 
        }
      });

      return sales$;
    } catch (firestoreError) {
      console.error(firestoreError);
      throw firestoreError;
    }
  }

  async getSalesBySellerId(userId: string): Promise<Sale[] | null> {
    try {
      const sales: Sale[] | null = await this.firestore.query({
        collection: 'sales',
        converter: this.saleConverter,
        queryConstraints: {
          filters: [{ field: 'sellerData.userId', operator: '==', value: userId }], 
          orderBy: { field: 'createdAt', direction: 'desc' }, 
        }
      });
      return sales;
    } catch (firestoreError) {
      console.error(firestoreError);
      throw firestoreError;
    }
  }

  getSalesBySellerId$(userId: string): Observable<Sale[] | null> | null {
    try {
      const sales$: Observable<Sale[] | null> | null = this.firestore.query$({
        collection: 'sales',
        converter: this.saleConverter,
        queryConstraints: {
          filters: [{ field: 'sellerData.userId', operator: '==', value: userId }], 
          orderBy: { field: 'createdAt', direction: 'desc' }, 
        }
      });

      return sales$;
    } catch (firestoreError) {
      console.error(firestoreError);
      throw firestoreError;
    }
  }

  async getSalesBySellerUsername(username: string): Promise<Sale[] | null> {
    try {
      const sales: Sale[] | null = await this.firestore.query({
        collection: 'sales',
        converter: this.saleConverter,
        queryConstraints: {
          filters: [{ field: 'sellerData.username', operator: '==', value: username }], 
          orderBy: { field: 'createdAt', direction: 'desc' }, 
        }
      });
      return sales;
    } catch (firestoreError) {
      console.error(firestoreError);
      throw firestoreError;
    }
  }

  getSalesBySellerUsername$(username: string): Observable<Sale[] | null> | null {
    try {
      const sales$: Observable<Sale[] | null> | null = this.firestore.query$({
        collection: 'sales',
        converter: this.saleConverter,
        queryConstraints: {
          filters: [{ field: 'sellerData.username', operator: '==', value: username }], 
          orderBy: { field: 'createdAt', direction: 'desc' }, 
        }
      });

      return sales$;
    } catch (firestoreError) {
      console.error(firestoreError);
      throw firestoreError;
    }
  }

  async getAllSales(): Promise<Sale[] | null> {
    try {
      return await this.firestore.getCollection({ collection: 'sales', converter: this.saleConverter });
    } catch (firestoreError) {
      console.error(firestoreError);
      throw firestoreError;
    }
  }

  getAllSales$(): Observable<Sale[] | null> | null {
    try {
      return this.firestore.getCollection$({ collection: 'sales', converter: this.saleConverter });
    } catch (firestoreError) {
      console.error(firestoreError);
      throw firestoreError;
    }
  }

  async saveSale(saleData: Partial<SaleModel>): Promise<Sale | null> {
    try {
      const _sale: Sale = Sale.Build(saleData);
      let sale: Sale | null;
      if (sale = await this.firestore.create(_sale, { collection: 'sales', converter: this.saleConverter })) {
        return sale;
      }
      return null;
    } catch (firestoreError) {
      throw firestoreError;
    }
  }

  async updateSale(saleData: Partial<SaleModel> & { _id: string }): Promise<Sale | null> {
    try {
      let sale: Sale | null;
      if (sale = await this.firestore.update(saleData, { collection: 'sales', converter: this.saleConverter })) {
        return sale;
      }
      return null;
    } catch (firestoreError) {
      throw firestoreError;
    }
  }

  async deleteSale(id: string): Promise<boolean> {
    try {
      return await this.firestore.remove(id);
    } catch (firestoreError) {
      throw firestoreError;
    }
  }

  async saleExists(id: string): Promise<boolean> {
    try {
      return await this.firestore.exists(id);
    } catch (firestoreError) {
      throw firestoreError;
    }
  }
}