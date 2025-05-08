import { InjectionToken } from "@angular/core";
import { Observable } from "rxjs/internal/Observable";
import { SaleModel, Sale } from "../models/sale.model";

export const SaleRepository = new InjectionToken<SaleRepository>('SaleRepository');

export interface SaleRepository {
  getSaleById(id: string): Promise<Sale | null>;
  getSaleById$?(id: string): Observable<Sale | null> | null;
  getSalesByBuyerId(userId: string): Promise<Sale[] | null>;
  getSalesByBuyerId$?(userId: string): Observable<Sale[] | null> | null;
  getSalesByBuyerUsername(username: string): Promise<Sale[] | null>;
  getSalesByBuyerUsername$?(username: string): Observable<Sale[] | null> | null;
  getSalesBySellerId(userId: string): Promise<Sale[] | null>;
  getSalesBySellerId$?(userId: string): Observable<Sale[] | null> | null;
  getSalesBySellerUsername(username: string): Promise<Sale[] | null>;
  getSalesBySellerUsername$?(username: string): Observable<Sale[] | null> | null;
  getAllSales(): Promise<Sale[] | null>;
  getAllSales$?(): Observable<Sale[] | null> | null;

  saveSale(saleData: Partial<SaleModel>): Promise<Sale | null>;
  updateSale(saleData: Partial<SaleModel> & { _id: string }): Promise<Sale | null>;
  deleteSale(id: string): Promise<boolean>;
  saleExists(id: string): Promise<boolean>;
}