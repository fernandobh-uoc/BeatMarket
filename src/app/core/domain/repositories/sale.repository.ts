import { inject, Injectable } from '@angular/core';
import { Cart } from '../models/cart.model';
import { Storage } from '../../services/storage/storage.interface';
import { environment } from 'src/environments/environment.dev';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({ providedIn: 'root' })
export class SaleRepository {
  private storage = inject<Storage<Cart>>(environment.storageTokens.user);
  //private converter: SaleConverter;

  async getSaleById(id: string): Promise<Cart | null> {
    try {
      return await this.storage.getById(id, { collection: 'carts' });
    } catch (storageError) {
      console.error(storageError);
    }
    return null;
  }

  getSaleById$(id: string): Observable<Cart | null> {
    return this.storage.getById$(id, { collection: 'carts' });
  }

  async saveSale(cart: Cart): Promise<Cart | null> {
    try {
      await this.storage.create(cart);
    } catch (storageError) {
      console.error(storageError);
    }
    return null;
  }

  async saleExists(id: string): Promise<boolean> {
    return await this.storage.exists(id);
  }
}