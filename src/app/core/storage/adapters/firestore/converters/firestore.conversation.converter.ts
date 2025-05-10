import { FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions, Timestamp, WithFieldValue } from "@angular/fire/firestore";
import { Conversation, ConversationModel, ParticipantModel } from "src/app/core/domain/models/conversation.model";
import { isFieldValue, isValidDateInput } from "./utils/converter.utils";

export interface FirestoreConversationModel {
  relatedPost: {
    title: string;
    price: number;
    status: string;
    mainImageURL: string;
  },
  initiatedBy: string;
  initiatedAt: Timestamp | null;
  lastUpdatedAt: Timestamp | null;
  lastMessage: {
    text: string;
    timestamp: Timestamp;
    senderId: string;
    recipientId: string;
    status: string;
  } | null;
  participants: [
    {
      participantId: string;
      username: string;
      profilePictureURL: string;
    },
    {
      participantId: string;
      username: string;
      profilePictureURL: string;
    }
  ]
}

export interface FirestoreMessageModel {
  text: string;
  timestamp: Timestamp;
  senderId: string;
  recipientId: string;
  status: string;
}

export class FirestoreConversationConverter implements FirestoreDataConverter<ConversationModel, FirestoreConversationModel> {
  toFirestore(conversation: WithFieldValue<ConversationModel>): WithFieldValue<FirestoreConversationModel> {
    const participants = (<[ParticipantModel, ParticipantModel]>conversation.participants).slice(0, 2).map(participant => ({
      participantId: participant.userId,
      username: participant.username,
      profilePictureURL: participant.profilePictureURL
    }));

    return {
      /* isValidDateInput(post.finishedAt) 
              ? Timestamp.fromDate(new Date(post.finishedAt)) 
              : isFieldValue(post.finishedAt)
                ? post.finishedAt
                : null */
      relatedPost: conversation.relatedPost,
      initiatedBy: conversation.initiatedBy,
      initiatedAt: isValidDateInput(conversation.initiatedAt) 
        ? Timestamp.fromDate(new Date(conversation.initiatedAt)) 
        : isFieldValue(conversation.initiatedAt)
          ? conversation.initiatedAt
          : null,
      lastUpdatedAt: isValidDateInput(conversation.lastUpdatedAt) 
        ? Timestamp.fromDate(new Date(conversation.lastUpdatedAt)) 
        : isFieldValue(conversation.lastUpdatedAt)
          ? conversation.lastUpdatedAt
          : null,
      lastMessage: isFieldValue(conversation.lastMessage) 
        ? conversation.lastMessage 
        : null, 
      participants: participants as [
        { participantId: string; username: string; profilePictureURL: string }, 
        { participantId: string; username: string; profilePictureURL: string }
      ]
    };
  }

  fromFirestore(snapshot: QueryDocumentSnapshot<FirestoreConversationModel>, options?: SnapshotOptions): ConversationModel {
    return Conversation.Build();
  }
}