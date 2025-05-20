import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';

import { ConversationRepository } from '../../../../domain/repositories/conversation.repository'; 
import { Storage } from '../../../storage.interface';
import { FirebaseFirestoreAdapter } from '../firebase-firestore.adapter';
import { ConversationModel, Conversation } from '../../../../domain/models/conversation.model'; 
import { FirestoreConversationConverter } from '../converters/firestore.conversation.converter'; 

@Injectable({ providedIn: 'root' })
export class FirestoreConversationRepository implements ConversationRepository {
  private storage: Storage<Conversation> = inject(FirebaseFirestoreAdapter<ConversationModel>);
  private conversationConverter: FirestoreConversationConverter = new FirestoreConversationConverter();

  async getConversationById(id: string): Promise<Conversation | null> {
    try {
      return await this.storage.getById(id, { collection: 'conversations' });
    } catch (storageError) {
      console.error(storageError);
      throw storageError;
    }
  }

  getConversationById$(id: string): Observable<Conversation | null> | null {
    if (!this.storage.getById$) return null;
    try {
      return this.storage.getById$(id, { collection: 'conversations' });
    } catch (storageError) {
      console.error(storageError);
      throw storageError;
    }
  }

  async getConversationsByInitiatorId(initiatorId: string): Promise<Conversation[] | null> {
    try {
      const conversations: Conversation[] | null = await this.storage.getByField('participants.initiator.userId', initiatorId, { collection: 'conversations', converter: this.conversationConverter });
      return conversations;
    } catch (storageError) {
      console.error(storageError);
      throw storageError;
    }
  }

  getConversationsByInitiatorId$(initiatorId: string): Observable<Conversation[] | null> | null {
    if (!this.storage.getByField$) return null;

    try {
      return this.storage.getByField$('participants.initiator.userId', initiatorId, { collection: 'conversations', converter: this.conversationConverter });
    } catch (storageError) {
      console.error(storageError);
      throw storageError;
    }
  }

  async getConversationsByRecipientId(recipientId: string): Promise<Conversation[] | null> {
    try {
      const conversations: Conversation[] | null = await this.storage.getByField('participants.recipient.userId', recipientId, { collection: 'conversations', converter: this.conversationConverter });
      return conversations;
    } catch (storageError) {
      console.error(storageError);
      throw storageError;
    }
  }

  getConversationsByRecipientId$(recipientId: string): Observable<Conversation[] | null> | null {
    if (!this.storage.getByField$) return null;

    try {
      return this.storage.getByField$('participants.recipient.userId', recipientId, { collection: 'conversations', converter: this.conversationConverter });
    } catch (storageError) {
      console.error(storageError);
      throw storageError;
    }
  }

  async getConversationsByPostId(postId: string): Promise<Conversation[] | null> {
    try {
      const conversations: Conversation[] | null = await this.storage.getByField('initiatedBy', postId, { collection: 'conversations', converter: this.conversationConverter });
      return conversations;
    } catch (storageError) {
      console.error(storageError);
      throw storageError;
    }
  }

  getConversationsByPostId$(postId: string): Observable<Conversation[] | null> | null {
    if (!this.storage.getByField$) return null;

    try {
      return this.storage.getByField$('initiatedBy', postId, { collection: 'conversations', converter: this.conversationConverter });
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