import { ResolveFn } from '@angular/router';
import { HistoryService } from '../../data-access/history.service';
import { inject } from '@angular/core';
import { Sale } from 'src/app/core/domain/models/sale.model';

export const boughtItemsResolver: ResolveFn<Sale[] | null> = async (route, state) => {
  const historyService = inject(HistoryService);
  return await historyService.getBoughtItems();
};

export const soldItemsResolver: ResolveFn<Sale[] | null> = async (route, state) => {
  const historyService = inject(HistoryService);
  return await historyService.getSoldItems();
};
