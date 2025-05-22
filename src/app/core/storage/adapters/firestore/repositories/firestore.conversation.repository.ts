import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';

import { ConversationRepository } from '../../../../domain/repositories/conversation.repository'; 
import { Storage } from '../../../storage.interface';
import { FirebaseFirestoreAdapter } from '../firebase-firestore.adapter';
import { ConversationModel, Conversation, MessageModel } from '../../../../domain/models/conversation.model'; 
import { FirestoreConversationConverter, FirestoreMessageConverter } from '../converters/firestore.conversation.converter'; 
import { auditTime, combineLatest, distinctUntilChanged, map, of, switchMap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FirestoreConversationRepository implements ConversationRepository {
  private storage: Storage<Conversation> = inject(FirebaseFirestoreAdapter<ConversationModel>);
  private conversationConverter: FirestoreConversationConverter = new FirestoreConversationConverter();
  private messageConverter: FirestoreMessageConverter = new FirestoreMessageConverter();

  async getConversationById(id: string): Promise<Conversation | null> {
    try {
      const conversation: Conversation | null = await this.storage.getById(id, { collection: 'conversations', converter: this.conversationConverter });
      if (!conversation) return null;

      if (!this.storage.getCollection) return conversation;

      const conversationMessages: MessageModel[] = await this.storage.getCollection({ 
        collection: `conversations/${id}/messages`, 
        converter: this.messageConverter
      });
      conversation.messages = conversationMessages ?? [];
      return conversation;
    } catch (storageError) {
      console.error(storageError);
      throw storageError;
    }
  }

  getConversationById$(id: string): Observable<Conversation | null> | null {
    if (!this.storage.getById$) return null;

    try {
      const conversation$: Observable<Conversation | null> = this.storage.getById$(id, { collection: 'conversations', converter: this.conversationConverter });
      
      //if (!this.storage.getCollection$) return conversation$;
      /* const conversationMessages$: Observable<MessageModel[]> = this.storage.getCollection$({
        collection: `conversations/${id}/messages`,
        converter: this.messageConverter
      }); */

      if (!this.storage.query$) return conversation$;
      const conversationMessages$: Observable<MessageModel[]> = this.storage.query$({
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
        //distinctUntilChanged((previous, current) => JSON.stringify(previous) === JSON.stringify(current))  // To avoid double updates 
        distinctUntilChanged((previous, current) => previous?.messages.length === current?.messages.length)  // To avoid double updates
      );
    } catch (storageError) {
      console.error(storageError);
      throw storageError;
    }
  }

  async getConversationsByBuyerId(buyerId: string): Promise<Conversation[] | null> {
    try {
      const conversations: Conversation[] | null = await this.storage.getByField('participants.buyer.userId', buyerId, { collection: 'conversations', converter: this.conversationConverter }); 
      if (!this.storage.getCollection || conversations === null) return conversations;

      for (let conversation of conversations) {
        conversation.messages = await this.storage.getCollection({ 
          collection: `conversations/${conversation._id}/messages`, 
          converter: this.messageConverter
        });
      }
      return conversations;
    } catch (storageError) {
      console.error(storageError);
      throw storageError;
    }
  }

  getConversationsByBuyerId$(buyerId: string): Observable<Conversation[] | null> | null {
    if (!this.storage.getByField$) return null;

    try {
      const conversations$: Observable<Conversation[] | null> = this.storage.getByField$('participants.buyer.userId', buyerId, { collection: 'conversations', converter: this.conversationConverter })
      if (!this.storage.getCollection$) return conversations$;

      return conversations$.pipe(
        switchMap((conversations: Conversation[] | null) => {
          if (!conversations || conversations.length === 0) return of(null);

          const conversationsWithMessages$ = conversations.map((conversation: Conversation) => {  
            if (!this.storage.getCollection$) return of(conversation);

            return this.storage.getCollection$({
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
    } catch (storageError) {
      console.error(storageError);
      throw storageError;
    }
  }

  async getConversationsBySellerId(sellerId: string): Promise<Conversation[] | null> {
    try {
      const conversations: Conversation[] | null = await this.storage.getByField('participants.seller.userId', sellerId, { collection: 'conversations', converter: this.conversationConverter }); 
      if (!this.storage.getCollection || conversations === null) return conversations;

      for (let conversation of conversations) {
        conversation.messages = await this.storage.getCollection({ 
          collection: `conversations/${conversation._id}/messages`, 
          converter: this.messageConverter
        });
      }
      return conversations;
    } catch (storageError) {
      console.error(storageError);
      throw storageError;
    }
  }

  getConversationsBySellerId$(sellerId: string): Observable<Conversation[] | null> | null {
    if (!this.storage.getByField$) return null;

    try {
      const conversations$: Observable<Conversation[] | null> = this.storage.getByField$('participants.seller.userId', sellerId, { collection: 'conversations', converter: this.conversationConverter })
      if (!this.storage.getCollection$) return conversations$;

      return conversations$.pipe(
        switchMap((conversations: Conversation[] | null) => {
          if (!conversations || conversations.length === 0) return of(null);

          const conversationsWithMessages$ = conversations.map((conversation: Conversation) => {  
            if (!this.storage.getCollection$) return of(conversation);

            const messages$ = this.storage.getCollection$({
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
    } catch (storageError) {
      console.error(storageError);
      throw storageError;
    }
  }

  async getConversationsByParticipantId(participantId: string): Promise<Conversation[] | null> {
    try {
      const conversationsAsBuyer: Conversation[] = await this.storage.getByField('participants.buyer.userId', participantId, { collection: 'conversations', converter: this.conversationConverter }) ?? []; 
      const conversationsAsSeller: Conversation[] = await this.storage.getByField('participants.seller.userId', participantId, { collection: 'conversations', converter: this.conversationConverter }) ?? []; 

      if (!this.storage.getCollection) return conversationsAsBuyer.concat(conversationsAsSeller);

      for (let conversation of conversationsAsBuyer) {
        conversation.messages = await this.storage.getCollection({ 
          collection: `conversations/${conversation._id}/messages`, 
          converter: this.messageConverter
        });
      }

      for (let conversation of conversationsAsSeller) {
        conversation.messages = await this.storage.getCollection({ 
          collection: `conversations/${conversation._id}/messages`, 
          converter: this.messageConverter
        });
      }

      return conversationsAsBuyer.concat(conversationsAsSeller);
    } catch (storageError) {
      console.error(storageError);
      throw storageError;
    }
  }

  getConversationsByParticipantId$(participantId: string): Observable<Conversation[] | null> | null {
    if (!this.storage.getByField$) return null;

    try {
      const conversationsAsBuyer$: Observable<Conversation[] | null> = this.storage.getByField$('participants.buyer.userId', participantId, { collection: 'conversations', converter: this.conversationConverter });
      const conversationsAsSeller$: Observable<Conversation[] | null> = this.storage.getByField$('participants.seller.userId', participantId, { collection: 'conversations', converter: this.conversationConverter });

      if (!this.storage.getCollection$) {
        return combineLatest([conversationsAsBuyer$, conversationsAsSeller$]).pipe(
          map(([conversationsAsBuyer, conversationsAsSeller]) => {
            return (conversationsAsBuyer ?? []).concat(conversationsAsSeller ?? []);
          })
        )
      };

      return combineLatest([conversationsAsBuyer$, conversationsAsSeller$]).pipe(
        map(([conversationsAsBuyer, conversationsAsSeller]) => {
          return (conversationsAsBuyer ?? []).concat(conversationsAsSeller ?? []);
        }),
        switchMap((conversations: Conversation[] | null) => {
          if (!conversations || conversations.length === 0) return of(null);

          const conversationsWithMessages$ = conversations.map((conversation: Conversation) => {  
            if (!this.storage.getCollection$) return of(conversation);

            return this.storage.getCollection$({
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

    } catch (storageError) {
      console.error(storageError);
      throw storageError;
    }
  }

  async getConversationsByPostId(postId: string): Promise<Conversation[] | null> {
    try {
      const conversations: Conversation[] | null = await this.storage.getByField('relatedPost.postId', postId, { collection: 'conversations', converter: this.conversationConverter }) ?? [];

      if (!this.storage.getCollection) return conversations;

      for (let conversation of conversations) {
        conversation.messages = await this.storage.getCollection({ 
          collection: `conversations/${conversation._id}/messages`, 
          converter: this.messageConverter
        });
      }
      return conversations;
    } catch (storageError) {
      console.error(storageError);
      throw storageError;
    }
  }

  getConversationsByPostId$(postId: string): Observable<Conversation[] | null> | null {
    if (!this.storage.getByField$) return null;

    try {
      //return this.storage.getByField$('initiatedBy', postId, { collection: 'conversations', converter: this.conversationConverter });
      const conversations$: Observable<Conversation[] | null> = this.storage.getByField$('relatedPost.postId', postId, { collection: 'conversations', converter: this.conversationConverter });

      if (!this.storage.getCollection$) return conversations$;

      return conversations$.pipe(
        switchMap((conversations: Conversation[] | null) => {
          if (!conversations || conversations.length === 0) return of(null);

          const conversationsWithMessages$ = conversations.map((conversation: Conversation) => {  
            if (!this.storage.getCollection$) return of(conversation);

            return this.storage.getCollection$({
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
    } catch (storageError) {
      console.error(storageError);
      throw storageError;
    }
  }

  async getAllConversations(): Promise<Conversation[] | null> {
    if (!this.storage.getCollection) return null;
    
    try {
      return await this.storage.getCollection({ collection: 'conversations', converter: this.conversationConverter });
    } catch (storageError) {
      console.error(storageError);
      throw storageError;
    }
  }

  getAllConversations$(): Observable<Conversation[] | null> | null {
    if (!this.storage.getCollection$) return null;

    try {
      return this.storage.getCollection$({ collection: 'conversations', converter: this.conversationConverter });
    } catch (storageError) {
      console.error(storageError);
      throw storageError;
    }
  }

  async queryConversations(queryConstraints?: any): Promise<Conversation[] | null> {
    try {
      return this.storage.query({ 
        collection: 'conversations',
        converter: this.conversationConverter,
        queryConstraints
      });
    } catch (storageError) {
      console.error(storageError);
      throw storageError;
    }
  }

  queryConversations$(queryConstraints?: any): Observable<Conversation[] | null> | null {
    if (!this.storage.query$) return null;

    try {
      return this.storage.query$({ 
        collection: 'conversations',
        converter: this.conversationConverter,
        queryConstraints
      });
    } catch (storageError) {
      console.error(storageError);
      throw storageError;
    }
  }

  async saveConversation(conversationData: Partial<ConversationModel>): Promise<Conversation | null> {
    try {
      const _conversation: Conversation = Conversation.Build(conversationData);
      let conversation: Conversation | null;
      if (conversation = await this.storage.create(_conversation, { collection: 'conversations', converter: this.conversationConverter })) {
        return conversation;
      }
      return null;
    } catch (storageError) {
      throw storageError;
    }
  }

  async updateConversation(conversationData: Partial<ConversationModel> & { _id: string }): Promise<Conversation | null> {
    try {
      let conversation: Conversation | null;
      if (conversation = await this.storage.update(conversationData, { collection: 'conversations', converter: this.conversationConverter })) {
        return conversation;
      }
      return null;
    } catch (storageError) {
      throw storageError;
    }
  }

  async saveMessage({ conversationId, messageData }: { conversationId: string, messageData: Partial<MessageModel> }): Promise<MessageModel | null> {
    if (!this.storage.createInSubcollection) return null;

    try {
      let message: MessageModel | null;
      if (message = await this.storage.createInSubcollection(
        messageData, 
        { 
          collection: `conversations/${conversationId}/messages`, 
          converter: this.messageConverter 
        })
      ) {
        return message;
      }
      return null;
    } catch (storageError) {
      throw storageError;
    }
  }

  async deleteConversation(id: string): Promise<boolean> {
    try {
      return await this.storage.remove(id);
    } catch (storageError) {
      throw storageError;
    }
  }

  async conversationExists(id: string): Promise<boolean> {
    try {
      return await this.storage.exists(id);
    } catch (storageError) {
      throw storageError;
    }
  }
}