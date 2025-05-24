import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { Sale } from 'src/app/core/domain/models/sale.model';
import { SaleRepository } from 'src/app/core/domain/repositories/sale.repository';

// UNUSED

export const boughtItemsResolver: ResolveFn<Sale[] | null> = async (route, state) => {
  const authService = inject(AuthService);
  const saleRepository = inject(SaleRepository);
  
  const userId = authService.authState().userId;
  return await saleRepository.getSalesByBuyerId(userId) ?? [];
};

export const soldItemsResolver: ResolveFn<Sale[] | null> = async (route, state) => {
  const authService = inject(AuthService);
  const saleRepository = inject(SaleRepository);

  const userId = authService.authState().userId;
  return await saleRepository.getSalesBySellerId(userId) ?? [];
};
