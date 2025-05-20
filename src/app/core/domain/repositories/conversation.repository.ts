import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { ConversationModel, Conversation } from '../models/conversation.model'; 

export const ConversationRepository = new InjectionToken<ConversationRepository>('ConversationRepository');

export interface ConversationRepository {
  getConversationById(id: string): Promise<Conversation | null>;
  getConversationById$?(id: string): Observable<Conversation | null> | null;
  getConversationsByInitiatorId(initiatorId: string): Promise<Conversation[] | null>;
  getConversationsByInitiatorId$?(initiatorId: string): Observable<Conversation[] | null> | null;
  getConversationsByRecipientId(recipientId: string): Promise<Conversation[] | null>;
  getConversationsByRecipientId$?(recipientId: string): Observable<Conversation[] | null> | null;
  getConversationsByPostId(postId: string): Promise<Conversation[] | null>;
  getConversationsByPostId$?(postId: string): Observable<Conversation[] | null> | null;
  getAllConversations(): Promise<Conversation[] | null>;
  getAllConversations$?(): Observable<Conversation[] | null> | null;
  queryConversations(queryConstraints?: any): Promise<Conversation[] | null>;
  queryConversations$?(queryConstraints?: any): Observable<Conversation[] | null> | null;
  saveConversation(conversationData: Partial<ConversationModel>): Promise<Conversation | null>;
  updateConversation(conversationData: Partial<ConversationModel> & { _id: string }): Promise<Conversation | null>;
  deleteConversation(id: string): Promise<boolean>;
  conversationExists(id: string): Promise<boolean>;
}