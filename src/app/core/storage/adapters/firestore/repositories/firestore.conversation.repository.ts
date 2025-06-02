import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';

import { ConversationRepository } from '../../../../domain/repositories/conversation.repository'; 
import { FirestoreAdapter } from '../firestore.adapter';
import { ConversationModel, Conversation, MessageModel } from '../../../../domain/models/conversation.model'; 
import { FirestoreConversationConverter, FirestoreMessageConverter } from '../converters/firestore.conversation.converter'; 
import { auditTime, combineLatest, distinctUntilChanged, map, of, switchMap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FirestoreConversationRepository implements ConversationRepository {
  private firestore: FirestoreAdapter<Conversation> = inject(FirestoreAdapter<ConversationModel>);
  private conversationConverter: FirestoreConversationConverter = new FirestoreConversationConverter();
  private messageConverter: FirestoreMessageConverter = new FirestoreMessageConverter();

  async getConversationById(id: string): Promise<Conversation | null> {
    try {
      const conversation: Conversation | null = await this.firestore.getById(id, { collection: 'conversations', converter: this.conversationConverter });
      if (!conversation) return null;

      const conversationMessages: MessageModel[] = await this.firestore.getCollection({ 
        collection: `conversations/${id}/messages`, 
        converter: this.messageConverter
      });
      conversation.messages = conversationMessages ?? [];
      return conversation;
    } catch (firestoreError) {
      console.error(firestoreError);
      throw firestoreError;
    }
  }

  getConversationById$(id: string): Observable<Conversation | null> | null {
    try {
      const conversation$: Observable<Conversation | null> = this.firestore.getById$(id, { collection: 'conversations', converter: this.conversationConverter });

      const conversationMessages$: Observable<MessageModel[]> = this.firestore.query$({
        collection: `conversations/${id}/messages`,
        converter: this.messageConverter,
        queryConstraints: {
          orderBy: { field: 'timestamp', direction: 'desc' }
        }
      })

      return combineLatest([conversation$, conversationMessages$]).pipe(
        map(([conversation, conversationMessages]) => {
          if (conversation) {
            return {
              ...conversation,
              messages: conversationMessages ?? []
            } as Conversation;
          }
          return null;
        }),
        distinctUntilChanged((previous, current) => previous?.messages.length === current?.messages.length)  // To avoid double updates
      );
    } catch (firestoreError) {
      console.error(firestoreError);
      throw firestoreError;
    }
  }

  async getConversationsByBuyerId(buyerId: string): Promise<Conversation[] | null> {
    try {
      const conversations: Conversation[] | null = await this.firestore.getByField('participants.buyer.userId', buyerId, { collection: 'conversations', converter: this.conversationConverter }); 
      if (!this.firestore.getCollection || conversations === null) return conversations;

      for (let conversation of conversations) {
        conversation.messages = await this.firestore.getCollection({ 
          collection: `conversations/${conversation._id}/messages`, 
          converter: this.messageConverter
        });
      }
      return conversations;
    } catch (firestoreError) {
      console.error(firestoreError);
      throw firestoreError;
    }
  }

  getConversationsByBuyerId$(buyerId: string): Observable<Conversation[] | null> | null {
    try {
      const conversations$: Observable<Conversation[] | null> = this.firestore.getByField$('participants.buyer.userId', buyerId, { collection: 'conversations', converter: this.conversationConverter })

      return conversations$.pipe(
        switchMap((conversations: Conversation[] | null) => {
          if (!conversations || conversations.length === 0) return of(null);

          const conversationsWithMessages$ = conversations.map((conversation: Conversation) => {  

            return this.firestore.getCollection$({
              collection: `conversations/${conversation._id}/messages`,
              converter: this.messageConverter
            }).pipe(
              map(messages => ({
                ...conversation,
                messages: messages ?? []
              }))
            ) as Observable<Conversation>;
          });

          return combineLatest(conversationsWithMessages$);
        })
      )
    } catch (firestoreError) {
      console.error(firestoreError);
      throw firestoreError;
    }
  }

  async getConversationsBySellerId(sellerId: string): Promise<Conversation[] | null> {
    try {
      const conversations: Conversation[] | null = await this.firestore.getByField('participants.seller.userId', sellerId, { collection: 'conversations', converter: this.conversationConverter }); 
      if (conversations === null) return conversations;

      for (let conversation of conversations) {
        conversation.messages = await this.firestore.getCollection({ 
          collection: `conversations/${conversation._id}/messages`, 
          converter: this.messageConverter
        });
      }
      return conversations;
    } catch (firestoreError) {
      console.error(firestoreError);
      throw firestoreError;
    }
  }

  getConversationsBySellerId$(sellerId: string): Observable<Conversation[] | null> | null {
    try {
      const conversations$: Observable<Conversation[] | null> = this.firestore.getByField$('participants.seller.userId', sellerId, { collection: 'conversations', converter: this.conversationConverter })

      return conversations$.pipe(
        switchMap((conversations: Conversation[] | null) => {
          if (!conversations || conversations.length === 0) return of(null);

          const conversationsWithMessages$ = conversations.map((conversation: Conversation) => {  
            const messages$ = this.firestore.getCollection$({
              collection: `conversations/${conversation._id}/messages`,
              converter: this.messageConverter
            });

            return messages$.pipe(
              map(messages => ({
                ...conversation,
                messages: messages ?? []
              }))
            ) as Observable<Conversation>;
          });

          return combineLatest(conversationsWithMessages$);
        })
      )
    } catch (firestoreError) {
      console.error(firestoreError);
      throw firestoreError;
    }
  }

  async getConversationsByParticipantId(participantId: string): Promise<Conversation[] | null> {
    try {
      const conversationsAsBuyer: Conversation[] = await this.firestore.getByField('participants.buyer.userId', participantId, { collection: 'conversations', converter: this.conversationConverter }) ?? []; 
      const conversationsAsSeller: Conversation[] = await this.firestore.getByField('participants.seller.userId', participantId, { collection: 'conversations', converter: this.conversationConverter }) ?? []; 

      for (let conversation of conversationsAsBuyer) {
        conversation.messages = await this.firestore.getCollection({ 
          collection: `conversations/${conversation._id}/messages`, 
          converter: this.messageConverter
        });
      }

      for (let conversation of conversationsAsSeller) {
        conversation.messages = await this.firestore.getCollection({ 
          collection: `conversations/${conversation._id}/messages`, 
          converter: this.messageConverter
        });
      }

      return conversationsAsBuyer.concat(conversationsAsSeller);
    } catch (firestoreError) {
      console.error(firestoreError);
      throw firestoreError;
    }
  }

  getConversationsByParticipantId$(participantId: string): Observable<Conversation[] | null> | null {
    try {
      const conversationsAsBuyer$: Observable<Conversation[] | null> = this.firestore.getByField$('participants.buyer.userId', participantId, { collection: 'conversations', converter: this.conversationConverter });
      const conversationsAsSeller$: Observable<Conversation[] | null> = this.firestore.getByField$('participants.seller.userId', participantId, { collection: 'conversations', converter: this.conversationConverter });

      return combineLatest([conversationsAsBuyer$, conversationsAsSeller$]).pipe(
        map(([conversationsAsBuyer, conversationsAsSeller]) => {
          return (conversationsAsBuyer ?? []).concat(conversationsAsSeller ?? []);
        }),
        switchMap((conversations: Conversation[] | null) => {
          if (!conversations || conversations.length === 0) return of(null);

          const conversationsWithMessages$ = conversations.map((conversation: Conversation) => {  
            return this.firestore.getCollection$({
              collection: `conversations/${conversation._id}/messages`,
              converter: this.messageConverter
            }).pipe(
              map(messages => ({
                ...conversation,
                messages: messages ?? []
              }))
            ) as Observable<Conversation>;
          });

          return combineLatest(conversationsWithMessages$);
        })
      );

    } catch (firestoreError) {
      console.error(firestoreError);
      throw firestoreError;
    }
  }

  async getConversationsByPostId(postId: string): Promise<Conversation[] | null> {
    try {
      const conversations: Conversation[] | null = await this.firestore.getByField('relatedPost.postId', postId, { collection: 'conversations', converter: this.conversationConverter }) ?? [];

      for (let conversation of conversations) {
        conversation.messages = await this.firestore.getCollection({ 
          collection: `conversations/${conversation._id}/messages`, 
          converter: this.messageConverter
        });
      }
      return conversations;
    } catch (firestoreError) {
      console.error(firestoreError);
      throw firestoreError;
    }
  }

  getConversationsByPostId$(postId: string): Observable<Conversation[] | null> | null {
    try {
      const conversations$: Observable<Conversation[] | null> = 
        this.firestore.getByField$('relatedPost.postId', postId, { 
          collection: 'conversations', 
          converter: this.conversationConverter 
        });

      return conversations$.pipe(
        switchMap((conversations: Conversation[] | null) => {
          if (!conversations || conversations.length === 0) return of(null);

          const conversationsWithMessages$ = conversations.map((conversation: Conversation) =>
            this.firestore.getCollection$({
              collection: `conversations/${conversation._id}/messages`,
              converter: this.messageConverter
            }).pipe(
              map(messages => ({
                ...conversation,
                messages: messages ?? []
              }))
            ) as Observable<Conversation>
          );

          return combineLatest(conversationsWithMessages$);
        })
      );
    } catch (firestoreError) {
      console.error(firestoreError);
      throw firestoreError;
    }
  }

  async getAllConversations(): Promise<Conversation[] | null> {
    try {
      return await this.firestore.getCollection({ collection: 'conversations', converter: this.conversationConverter });
    } catch (firestoreError) {
      console.error(firestoreError);
      throw firestoreError;
    }
  }

  getAllConversations$(): Observable<Conversation[] | null> | null {
    try {
      return this.firestore.getCollection$({ collection: 'conversations', converter: this.conversationConverter });
    } catch (firestoreError) {
      console.error(firestoreError);
      throw firestoreError;
    }
  }

  async queryConversations(queryConstraints?: any): Promise<Conversation[] | null> {
    try {
      return this.firestore.query({ 
        collection: 'conversations',
        converter: this.conversationConverter,
        queryConstraints
      });
    } catch (firestoreError) {
      console.error(firestoreError);
      throw firestoreError;
    }
  }

  queryConversations$(queryConstraints?: any): Observable<Conversation[] | null> | null {
    try {
      return this.firestore.query$({ 
        collection: 'conversations',
        converter: this.conversationConverter,
        queryConstraints
      });
    } catch (firestoreError) {
      console.error(firestoreError);
      throw firestoreError;
    }
  }

  async saveConversation(conversationData: Partial<ConversationModel>): Promise<Conversation | null> {
    try {
      const _conversation: Conversation = Conversation.Build(conversationData);
      let conversation: Conversation | null;
      if (conversation = await this.firestore.create(_conversation, { collection: 'conversations', converter: this.conversationConverter })) {
        return conversation;
      }
      return null;
    } catch (firestoreError) {
      throw firestoreError;
    }
  }

  async updateConversation(conversationData: Partial<ConversationModel> & { _id: string }): Promise<Conversation | null> {
    try {
      let conversation: Conversation | null;
      if (conversation = await this.firestore.update(conversationData, { collection: 'conversations', converter: this.conversationConverter })) {
        return conversation;
      }
      return null;
    } catch (firestoreError) {
      throw firestoreError;
    }
  }

  async saveMessage({ conversationId, messageData }: { conversationId: string, messageData: Partial<MessageModel> }): Promise<MessageModel | null> {
    try {
      let message: MessageModel | null;
      if (message = await this.firestore.createInSubcollection(
        messageData, 
        { 
          collection: `conversations/${conversationId}/messages`, 
          converter: this.messageConverter 
        })
      ) {
        return message;
      }
      return null;
    } catch (firestoreError) {
      throw firestoreError;
    }
  }

  async deleteConversation(id: string): Promise<boolean> {
    try {
      return await this.firestore.remove(id);
    } catch (firestoreError) {
      throw firestoreError;
    }
  }

  async conversationExists(id: string): Promise<boolean> {
    try {
      return await this.firestore.exists(id);
    } catch (firestoreError) {
      throw firestoreError;
    }
  }
}