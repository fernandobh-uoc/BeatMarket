import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Conversation } from 'src/app/core/domain/models/conversation.model';
import { ConversationRepository } from 'src/app/core/domain/repositories/conversation.repository';
import { AuthStatus } from 'src/app/core/services/auth/auth.service';
import { LocalStorageService } from 'src/app/core/storage/local-storage.service';

// UNUSED

export const conversationsAsSellerResolver: ResolveFn<Conversation[]> = async (route, state) => {
  const conversationRepository = inject(ConversationRepository);
  const cache = inject(LocalStorageService);

  const userId = (await cache.get<AuthStatus>('authStatus'))?.userId ?? ''; 
  return await conversationRepository.getConversationsBySellerId(userId) ?? [];
};

export const conversationsAsBuyerResolver: ResolveFn<Conversation[]> = async (route, state) => {
  const conversationRepository = inject(ConversationRepository);
  const cache = inject(LocalStorageService);

  const userId = (await cache.get<AuthStatus>('authStatus'))?.userId ?? ''; 
  return await conversationRepository.getConversationsByBuyerId(userId) ?? [];
};
