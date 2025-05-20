import { JSONSerializable } from "../../interfaces/jsonserializable.interface";
import { UserModel } from "./user.model";
import { Timestamps } from "./appModel.type";

export enum MessageStatus {
  Pending = 'Pendiente',
  Sent = 'Enviado',
  Received = 'Recibido'
}

export interface RelatedPostModel {
  postId: string;
  title: string;
  price: number;
  isActive: boolean;
  mainImageURL: string;
}

export interface ParticipantModel {
  userId: UserModel["_id"];
  username: UserModel["username"];
  profilePictureURL: UserModel["profilePictureURL"];
}

export interface MessageModel {
  _id: string;
  text: string;
  timestamp: Date;
  senderId: UserModel["_id"];
  recipientId: UserModel["_id"];
  status: MessageStatus;
}

export interface ConversationModel extends JSONSerializable<ConversationModel>, Timestamps {
  _id: string;
  relatedPost: RelatedPostModel;
  initiatedAt: Date;
  lastUpdatedAt: Date;
  //participants: [ParticipantModel, ParticipantModel],
  participants: {
    initiator: ParticipantModel,
    recipient: ParticipantModel
  },
  messages: MessageModel[];  // Subcollection
}

export class Conversation implements ConversationModel {
  public _id: string = '';
  public relatedPost: RelatedPostModel = { 
    postId: '', 
    title: '', 
    price: 0,
    isActive: true,
    mainImageURL: '' 
  };
  public initiatedAt: Date = new Date();
  public lastUpdatedAt: Date = new Date();
  public participants: { initiator: ParticipantModel, recipient: ParticipantModel } = {
    initiator: { userId: '', username: '', profilePictureURL: '' },
    recipient: { userId: '', username: '', profilePictureURL: '' }
  };
  public messages: MessageModel[] = [];

  private constructor(conversation: Partial<ConversationModel> = {}) {
    Object.assign(this, { ...conversation });
  }

  static Build(conversation: Partial<ConversationModel> = {}): Conversation {
    return new Conversation(conversation);
  }

  public toJSON(): string {
    const serialized = Object.assign(this);
    delete serialized._id;
    try {
      const jsonStr = JSON.stringify(serialized);
      return jsonStr;
    } catch (error) {
      console.error(`Error stringifying object ${serialized}: ${error}`)
    }
    return '';
  }

  public fromJSON(json: string): ConversationModel | null {
    try {
      const obj = JSON.parse(json);
      return obj as Conversation;
    } catch (error) {
      console.error(`Error parsing json ${json}: ${error}`);
    }
    return null;
  }
}

export function isConversationModel(obj: any): obj is ConversationModel {
  return typeof obj === 'object' &&
    obj !== null &&
    typeof obj._id === 'string' &&
    typeof obj.relatedPost === 'object' &&
    typeof obj.initiatedAt === 'object' &&
    typeof obj.lastUpdatedAt === 'object' &&
    Array.isArray(obj.participants);
}