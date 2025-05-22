import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { ConversationModel, Conversation, MessageModel } from '../models/conversation.model'; 

export const ConversationRepository = new InjectionToken<ConversationRepository>('ConversationRepository');

export interface ConversationRepository {
  getConversationById(id: string): Promise<Conversation | null>;
  getConversationById$?(id: string): Observable<Conversation | null> | null;
  getConversationsByParticipantId$?(participantId: string): Observable<Conversation[] | null> | null;
  getConversationsByBuyerId(initiatorId: string): Promise<Conversation[] | null>;
  getConversationsByBuyerId$?(initiatorId: string): Observable<Conversation[] | null> | null;
  getConversationsBySellerId(recipientId: string): Promise<Conversation[] | null>;
  getConversationsBySellerId$?(recipientId: string): Observable<Conversation[] | null> | null;
  getConversationsByParticipantId(participantId: string): Promise<Conversation[] | null>;
  getConversationsByPostId(postId: string): Promise<Conversation[] | null>;
  getConversationsByPostId$?(postId: string): Observable<Conversation[] | null> | null;
  getAllConversations(): Promise<Conversation[] | null>;
  getAllConversations$?(): Observable<Conversation[] | null> | null;
  queryConversations(queryConstraints?: any): Promise<Conversation[] | null>;
  queryConversations$?(queryConstraints?: any): Observable<Conversation[] | null> | null;
  saveConversation(conversationData: Partial<ConversationModel>): Promise<Conversation | null>;
  updateConversation(conversationData: Partial<ConversationModel> & { _id: string }): Promise<Conversation | null>;
  saveMessage({ conversationId, messageData }: { conversationId: string, messageData: Partial<MessageModel> }): Promise<MessageModel | null>;
  deleteConversation(id: string): Promise<boolean>;
  conversationExists(id: string): Promise<boolean>;
}