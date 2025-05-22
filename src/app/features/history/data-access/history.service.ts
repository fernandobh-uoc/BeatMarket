import { computed, inject, Injectable, resource, signal } from '@angular/core';
import { Sale } from 'src/app/core/domain/models/sale.model';
import { SaleRepository } from 'src/app/core/domain/repositories/sale.repository';
import { AuthService } from 'src/app/core/services/auth/auth.service';

type HistoryState = {
  boughtItems: Sale[];
  soldItems: Sale[];
  loading: boolean;
  errorMessage: string;
}

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  private saleRepository = inject(SaleRepository);
  private authService = inject(AuthService);
  
  private boughtItems = resource<Sale[], string>({
    request: () => this.authService.authStatus().userId,
    loader: async ({ request: userId }): Promise<Sale[]> => {
      if (!userId) return [];
      try {
        return await this.saleRepository.getSalesByBuyerId(userId) ?? [];
      } catch (error) {
        this.errorMessage.set((error as any)?.message ?? 'Unknown error');
        return [];
      }
    }
  })

  private soldItems = resource<Sale[], string>({
    request: () => this.authService.authStatus().userId,
    loader: async ({ request: userId }): Promise<Sale[]> => {
      if (!userId) return [];
      try {
        return await this.saleRepository.getSalesBySellerId(userId) ?? [];
      } catch (error) {
        this.errorMessage.set((error as any)?.message ?? 'Unknown error');
        return [];
      }
    }
  })
  
  private errorMessage = signal<string>('');

  historyState = computed<HistoryState>(() => ({
    boughtItems: this.boughtItems.value() ?? [],
    soldItems: this.soldItems.value() ?? [],
    loading: this.boughtItems.isLoading() || this.soldItems.isLoading(),
    errorMessage: this.errorMessage()
  }));

  constructor() { }

  reloadResources(): void {
    this.boughtItems.reload();
    this.soldItems.reload();
  }
}
