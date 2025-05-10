import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs/internal/Observable";
import { map } from "rxjs/operators";

import { SaleRepository } from "../sale.repository";
import { Storage } from "src/app/core/storage/storage.interface";
import { FirebaseFirestoreAdapter } from "src/app/core/storage/adapters/firebase-firestore.adapter";
import { SaleModel, Sale } from "../../models/sale.model";
import { FirestoreSaleConverter } from "src/app/core/storage/adapters/converters/firestore.sale.converter";

@Injectable({ providedIn: 'root' })
export class FirestoreSaleRepository implements SaleRepository {
  private storage = inject<Storage<Sale>>(FirebaseFirestoreAdapter<SaleModel>);
  private saleConverter: FirestoreSaleConverter;

  constructor() {
    this.saleConverter = new FirestoreSaleConverter();
  }

  async getSaleById(id: string): Promise<Sale | null> {
    try {
      return await this.storage.getById(id, { collection: 'sales' });
    } catch (storageError) {
      console.error(storageError);
      throw storageError;
    }
  }

  getSaleById$(id: string): Observable<Sale | null> | null {
    if (!this.storage.getById$) return null;
    try {
      return this.storage.getById$(id, { collection: 'sales' });
    } catch (storageError) {
      console.error(storageError);
      throw storageError;
    }
  }

  async getSalesByBuyerId(userId: string): Promise<Sale[] | null> {
    try {
      const sales: Sale[] | null = await this.storage.getByField('buyerData.userId', userId, { collection: 'sales', converter: this.saleConverter });
      return sales;
    } catch (storageError) {
      console.error(storageError);
      throw storageError;
    }
  }

  getSalesByBuyerId$(userId: string): Observable<Sale[] | null> | null {
    if (!this.storage.getByField$) return null;

    try {
      return this.storage.getByField$('buyerData.userId', userId, { collection: 'sales', converter: this.saleConverter }).pipe(
        map(sales => sales && sales.length > 0 ? sales : null)
      );
    } catch (storageError) {
      console.error(storageError);
      throw storageError;
    }
  }

  async getSalesByBuyerUsername(username: string): Promise<Sale[] | null> {
    try {
      const sales: Sale[] | null = await this.storage.getByField('buyerData.username', username, { collection: 'sales', converter: this.saleConverter });
      return sales;
    } catch (storageError) {
      console.error(storageError);
      throw storageError;
    }
  }

  getSalesByBuyerUsername$(username: string): Observable<Sale[] | null> | null {
    if (!this.storage.getByField$) return null;

    try {
      return this.storage.getByField$('buyerData.username', username, { collection: 'sales', converter: this.saleConverter }).pipe(
        map(sales => sales && sales.length > 0 ? sales : null)
      );
    } catch (storageError) {
      console.error(storageError);
      throw storageError;
    }
  }

  async getSalesBySellerId(userId: string): Promise<Sale[] | null> {
    try {
      const sales: Sale[] | null = await this.storage.getByField('sellerData.userId', userId, { collection: 'sales', converter: this.saleConverter });
      return sales;
    } catch (storageError) {
      console.error(storageError);
      throw storageError;
    }
  }

  getSalesBySellerId$(userId: string): Observable<Sale[] | null> | null {
    if (!this.storage.getByField$) return null;

    try {
      return this.storage.getByField$('sellerData.userId', userId, { collection: 'sales', converter: this.saleConverter }).pipe(
        map(sales => sales && sales.length > 0 ? sales : null)
      );
    } catch (storageError) {
      console.error(storageError);
      throw storageError;
    }
  }

  async getSalesBySellerUsername(username: string): Promise<Sale[] | null> {
    try {
      const sales: Sale[] | null = await this.storage.getByField('sellerData.username', username, { collection: 'sales', converter: this.saleConverter });
      return sales;
    } catch (storageError) {
      console.error(storageError);
      throw storageError;
    }
  }

  getSalesBySellerUsername$(username: string): Observable<Sale[] | null> | null {
    if (!this.storage.getByField$) return null;

    try {
      return this.storage.getByField$('sellerData.username', username, { collection: 'sales', converter: this.saleConverter }).pipe(
        map(sales => sales && sales.length > 0 ? sales : null)
      );
    } catch (storageError) {
      console.error(storageError);
      throw storageError;
    }
  }

  async getAllSales(): Promise<Sale[] | null> {
    if (!this.storage.getCollection) return null;
    
    try {
      return await this.storage.getCollection({ collection: 'sales', converter: this.saleConverter });
    } catch (storageError) {
      console.error(storageError);
      throw storageError;
    }
  }

  getAllSales$(): Observable<Sale[] | null> | null {
    if (!this.storage.getCollection$) return null;

    try {
      return this.storage.getCollection$({ collection: 'sales', converter: this.saleConverter });
    } catch (storageError) {
      console.error(storageError);
      throw storageError;
    }
  }

  async saveSale(saleData: Partial<SaleModel>): Promise<Sale | null> {
    try {
      const _sale: Sale = Sale.Build(saleData);
      let sale: Sale | null;
      if (sale = await this.storage.create(_sale, { collection: 'sales', converter: this.saleConverter })) {
        return sale;
      }
      return null;
    } catch (storageError) {
      throw storageError;
    }
  }

  async updateSale(saleData: Partial<SaleModel> & { _id: string }): Promise<Sale | null> {
    try {
      let sale: Sale | null;
      if (sale = await this.storage.update(saleData, { collection: 'sales', converter: this.saleConverter })) {
        return sale;
      }
      return null;
    } catch (storageError) {
      throw storageError;
    }
  }

  async deleteSale(id: string): Promise<boolean> {
    try {
      return await this.storage.remove(id);
    } catch (storageError) {
      throw storageError;
    }
  }

  async saleExists(id: string): Promise<boolean> {
    try {
      return await this.storage.exists(id);
    } catch (storageError) {
      throw storageError;
    }
  }
}