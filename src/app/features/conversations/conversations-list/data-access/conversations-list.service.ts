import { computed, inject, Injectable, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Observable, of } from 'rxjs';
import { ConversationModel } from 'src/app/core/domain/models/conversation.model';
import { ConversationRepository } from 'src/app/core/domain/repositories/conversation.repository';
import { AuthService } from 'src/app/core/services/auth/auth.service';

type ConversationsListState = {
  conversationsAsSeller: ConversationModel[],
  conversationsAsBuyer: ConversationModel[],
  loading: boolean,
  errorMessage: string
}

@Injectable({
  providedIn: 'root'
})
export class ConversationsListService {
  private conversationRepository = inject(ConversationRepository);
  private authService = inject(AuthService);
  
  private errorMessage = signal<string>('');

  private conversationsAsSeller = rxResource<ConversationModel[] | null, string | null>({
    request: () => this.authService.currentUser()?._id ?? null,
    loader: ({ request: userId }): Observable<ConversationModel[] | null> => {
      if (!this.conversationRepository.getConversationsBySellerId$) return of(null);
      if (!userId) return of(null);
      try {
        const conversations$ = this.conversationRepository.getConversationsBySellerId$(userId);
        return conversations$ ?? of(null);
      } catch (error) {
        this.errorMessage.set((error as any)?.message ?? 'Unknown error');
        return of(null);
      }
    }
  });

  private conversationsAsBuyer = rxResource<ConversationModel[] | null, string | null>({
    request: () => this.authService.currentUser()?._id ?? null,
    loader: ({ request: userId }): Observable<ConversationModel[] | null> => {
      if (!this.conversationRepository.getConversationsByBuyerId$) return of(null);
      if (!userId) return of(null);
      try {
        const conversations$ = this.conversationRepository.getConversationsByBuyerId$(userId);
        return conversations$ ?? of(null);
      } catch (error) {
        this.errorMessage.set((error as any)?.message ?? 'Unknown error');
        return of(null);
      }
    }
  });

  conversationsListState = computed<ConversationsListState>(() => ({
    conversationsAsSeller: this.conversationsAsSeller.value() ?? [],
    conversationsAsBuyer: this.conversationsAsBuyer.value() ?? [],
    loading: this.conversationsAsSeller.isLoading() || this.conversationsAsBuyer.isLoading(),
    errorMessage: this.errorMessage()
  }))

  constructor() {}
}
