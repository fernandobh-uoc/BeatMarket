import { JSONSerializable } from "../../interfaces/jsonserializable.interface";
import { UserModel } from "./user.model";
import { PostModel } from "./post.model";

export enum MessageStatus {
  Pending = 'Pendiente',
  Sent = 'Enviado',
  Received = 'Recibido'
}

interface MessageModel {
  _id: string;
  text: string;
  timestamp: Date;
  senderId: UserModel["_id"];
  recipientId: UserModel["_id"];
  status: MessageStatus;
}

interface ParticipantModel {
  participantId: UserModel["_id"];
  username: UserModel["username"];
  profilePictureURL: UserModel["profilePictureURL"];
}

export interface ConversationModel extends JSONSerializable<ConversationModel> {
  _id: string;
  relatedPost: Partial<PostModel>;
  initiatedBy: UserModel["_id"];
  initiatedAt: Date;
  lastUpdatedAt: Date;
  lastMessage: MessageModel | null;
  participants: [ParticipantModel, ParticipantModel],
  messages: MessageModel[] | null;  // Subcollection
}

export class Conversation implements ConversationModel {
  public _id: string = '';
  public relatedPost: Partial<PostModel> = {};
  public initiatedBy: UserModel["_id"] = '';
  public initiatedAt: Date = new Date();
  public lastUpdatedAt: Date = new Date();
  public lastMessage: MessageModel | null = null;
  public participants: [ParticipantModel, ParticipantModel] = [{ participantId: '', username: '', profilePictureURL: '' }, { participantId: '', username: '', profilePictureURL: '' }];
  public messages: MessageModel[] | null = null;

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