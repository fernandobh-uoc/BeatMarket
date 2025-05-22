import { Injectable, inject, signal, computed } from '@angular/core'; 
import { rxResource } from '@angular/core/rxjs-interop';
import { Observable, of } from 'rxjs';
import { Conversation, ConversationModel, ParticipantModel, RelatedPostModel } from 'src/app/core/domain/models/conversation.model';
import { ConversationRepository } from 'src/app/core/domain/repositories/conversation.repository';
import { AuthService } from 'src/app/core/services/auth/auth.service';

type ConversationState = {
  conversation: ConversationModel | null;
  role: 'buyer' | 'seller';
  loading: boolean;
  errorMessage: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConversationService {
  private conversationRepository = inject(ConversationRepository);
  private authService = inject(AuthService);

  private conversationId = signal<string | undefined>(undefined);

  private errorMessage = signal<string>('');

  private conversation = rxResource<ConversationModel | null, string | undefined>({
    request: () => this.conversationId(),
    loader: ({ request: conversationId }): Observable<ConversationModel | null> => {
      if (!this.conversationRepository.getConversationById$) return of(null);
      if (!conversationId) return of(null);

      try {
        const conversation$ = this.conversationRepository.getConversationById$(conversationId);
        return conversation$ ?? of(null);
      } catch (error) {
        this.errorMessage.set((error as any)?.message ?? 'Unknown error');
        return of(null);
      }
    }
  })

  conversationState = computed<ConversationState>(() => ({
    conversation: this.conversation.value() ?? null,
    loading: this.conversation.isLoading(),
    role: this.conversation.value()?.participants.buyer.userId === this.authService.currentUser()?._id ? 'buyer' : 'seller',
    errorMessage: this.errorMessage()
  }));

  constructor() {}

  setConversationId(conversationId: string): void {
    this.conversationId.set(conversationId);
  }

  async getConversationId({ postId }: { postId: string }): Promise<string | null> { 
    try {
      const postConversations: Conversation[] = await this.conversationRepository.getConversationsByPostId(postId) ?? [];
      
      // If the post has related conversations... 
      if (postConversations.length > 0) {
        const conversation = postConversations.find(conversation => {
          const userId = this.authService.currentUser()?._id;
          return (
            conversation.participants.buyer.userId === userId ||
            conversation.participants.seller.userId === userId
          );
        })
  
        // ... and there is a conversation for which the current user is a participant,
        // return the conversation id
        if (conversation) {
          return conversation._id;
        }
      }

      // Else, there is no conversation for the current user and the given post
      return null;
    } catch (error) {
      throw error;
    }
  }

  async createConversation({ 
    relatedPostData, 
    buyerData, 
    sellerData }: { 
      relatedPostData: RelatedPostModel,
      buyerData: ParticipantModel, 
      sellerData: ParticipantModel 
    }): Promise<string | null> { 
    try {
      const conversationData: Partial<ConversationModel> = {
        relatedPost: relatedPostData,
        participants: {
          buyer: buyerData,
          seller: sellerData
        }
      };

      const newConversation: ConversationModel | null = await this.conversationRepository.saveConversation(conversationData);
      if (!newConversation) return null;
      
      return newConversation._id;
    } catch (error) {
      throw error;
    }
  }

  async sendMessage(message: string): Promise<void> {
    const conversation = this.conversationState().conversation;
    if (!conversation) return;

    await this.conversationRepository.saveMessage({
      conversationId: conversation._id,
      messageData: {
        text: message,
        timestamp: new Date(),
        senderId: this.authService.currentUser()?._id,
        recipientId: conversation.participants[this.conversationState().role === 'buyer' ? 'seller' : 'buyer'].userId
      }
    });
  }
}
