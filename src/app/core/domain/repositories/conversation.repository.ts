import { inject, Injectable } from '@angular/core';
import { Conversation } from '../models/conversation.model';
import { Storage } from '../../services/storage/storage.interface';
import { environment } from 'src/environments/environment.dev';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({ providedIn: 'root' })
export class ConversationRepository {
  private storage = inject<Storage<Conversation>>(environment.storageTokens.user);
  //private converter: ConversationConverter;

  async getConversationById(id: string): Promise<Conversation | null> {
    try {
      return await this.storage.getById(id, { collection: 'conversations' });
    } catch (storageError) {
      console.error(storageError);
    }
    return null;
  }

  getConversationById$(id: string): Observable<Conversation | null> {
    return this.storage.getById$(id, { collection: 'conversations' });
  }

  async saveConversation(conversation: Conversation): Promise<Conversation | null> {
    try {
      await this.storage.create(conversation);
    } catch (storageError) {
      console.error(storageError);
    }
    return null;
  }

  async conversationExists(id: string): Promise<boolean> {
    return await this.storage.exists(id);
  }
}