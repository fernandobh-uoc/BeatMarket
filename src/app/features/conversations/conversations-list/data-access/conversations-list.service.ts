import { computed, inject, Injectable, resource, signal } from '@angular/core';
import { ConversationModel } from 'src/app/core/domain/models/conversation.model';
import { User } from 'src/app/core/domain/models/user.model';
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

  private conversationsAsSeller = resource<ConversationModel[], User | null>({
    request: () => this.authService.currentUser(),
    loader: async ({ request: currentUser }): Promise<ConversationModel[]> => {
      if (!currentUser) return [];
      try {
        const conversations = await this.conversationRepository.getConversationsBySellerId(currentUser._id);
        return conversations ?? [];
      } catch (error) {
        this.errorMessage.set((error as any)?.message ?? 'Unknown error');
        return [];
      }
    }
  })
  
  private conversationsAsBuyer = resource<ConversationModel[], User | null>({
    request: () => this.authService.currentUser(),
    loader: async ({ request: currentUser }): Promise<ConversationModel[]> => {
      if (!currentUser) return [];
      try {
        const conversations = await this.conversationRepository.getConversationsByBuyerId(currentUser._id);
        return conversations ?? [];
      } catch (error) {
        this.errorMessage.set((error as any)?.message ?? 'Unknown error');
        return [];
      }
    }
  })

  conversationsListState = computed<ConversationsListState>(() => ({
    conversationsAsSeller: this.conversationsAsSeller.value() ?? [],
    conversationsAsBuyer: this.conversationsAsBuyer.value() ?? [],
    loading: this.conversationsAsSeller.isLoading() || this.conversationsAsBuyer.isLoading(),
    errorMessage: this.errorMessage()
  }))

  constructor() {}
}
