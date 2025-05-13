import { inject, Injectable, signal } from '@angular/core';
import { Sale } from 'src/app/core/domain/models/sale.model';
import { SaleRepository } from 'src/app/core/domain/repositories/sale.repository';
import { AuthStatus } from 'src/app/core/services/auth/auth.service';
import { LocalStorageService } from 'src/app/core/storage/local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  private saleRepository = inject(SaleRepository);
  private cache = inject(LocalStorageService);
  
  errorMessage = signal<string>('');

  constructor() { }

  async getBoughtItems(): Promise<Sale[]> { 
    try {
      const userId = (await this.cache.get<AuthStatus>('authStatus'))?.userId ?? '';
      if (!userId) return [];
      return await this.saleRepository.getSalesByBuyerId(userId) ?? [];
    } catch (error) {
      console.error(error);
      this.errorMessage.set(error as string);
      throw error;
    }
  }

  async getSoldItems(): Promise<Sale[]> { 
    try {
      const userId = (await this.cache.get<AuthStatus>('authStatus'))?.userId ?? '';
      if (!userId) return [];
      return await this.saleRepository.getSalesBySellerId(userId) ?? [];
    } catch (error) {
      console.error(error);
      this.errorMessage.set(error as string);
      throw error;
    }
  }
}
