import { FirestoreDataConverter, QueryDocumentSnapshot, serverTimestamp, SnapshotOptions, Timestamp, WithFieldValue } from "@angular/fire/firestore";
import { Conversation, ConversationModel, MessageModel, ParticipantModel } from "src/app/core/domain/models/conversation.model";
import { isFieldValue, isFirestoreTimestamp, isValidDateInput } from "./utils/converter.utils";

export interface FirestoreConversationModel {
  relatedPost: {
    postId: string;
    title: string;
    price: number;
    isActive: boolean;
    mainImageURL: string;
  },
  participants: {
    buyer: {
      userId: string;
      username: string;
      profilePictureURL: string;
    },
    seller: {
      userId: string;
      username: string;
      profilePictureURL: string;
    }
  },
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FirestoreMessageModel {
  text: string;
  timestamp: Timestamp;
  senderId: string;
  recipientId: string;
  //status: string;
}

export class FirestoreConversationConverter implements FirestoreDataConverter<ConversationModel, FirestoreConversationModel> {
  toFirestore(conversation: WithFieldValue<ConversationModel>): WithFieldValue<FirestoreConversationModel> {
    return {
      relatedPost: conversation.relatedPost,
      participants: isFieldValue(conversation.participants)
        ? conversation.participants
        : {
          buyer: {
            userId: (conversation.participants as { buyer: ParticipantModel; seller: ParticipantModel }).buyer.userId,
            username: (conversation.participants as { buyer: ParticipantModel; seller: ParticipantModel }).buyer.username,
            profilePictureURL: (conversation.participants as { buyer: ParticipantModel; seller: ParticipantModel }).buyer.profilePictureURL
          },
          seller: {
            userId: (conversation.participants as { buyer: ParticipantModel; seller: ParticipantModel }).seller.userId,
            username: (conversation.participants as { buyer: ParticipantModel; seller: ParticipantModel }).seller.username,
            profilePictureURL: (conversation.participants as { buyer: ParticipantModel; seller: ParticipantModel }).seller.profilePictureURL
          }
        },
      createdAt: isValidDateInput(conversation.createdAt)
        ? Timestamp.fromDate(new Date(conversation.createdAt))
        : isFieldValue(conversation.createdAt)
          ? conversation.createdAt
          : serverTimestamp(),
      updatedAt: isValidDateInput(conversation.updatedAt)
        ? Timestamp.fromDate(new Date(conversation.updatedAt))
        : isFieldValue(conversation.updatedAt)
          ? conversation.updatedAt
          : serverTimestamp(),
    };
  }

  fromFirestore(snapshot: QueryDocumentSnapshot<FirestoreConversationModel>, options?: SnapshotOptions): ConversationModel {
    const data = snapshot.data(options);

    return Conversation.Build({
      _id: snapshot.id,
      relatedPost: data.relatedPost,
      participants: {
        buyer: {
          userId: data.participants.buyer.userId,
          username: data.participants.buyer.username,
          profilePictureURL: data.participants.buyer.profilePictureURL
        },
        seller: {
          userId: data.participants.seller.userId,
          username: data.participants.seller.username,
          profilePictureURL: data.participants.seller.profilePictureURL
        }
      },
      createdAt: isFirestoreTimestamp(data.createdAt)
        ? data.createdAt.toDate()
        : null,
      updatedAt: isFirestoreTimestamp(data.updatedAt)
        ? data.updatedAt.toDate()
        : null,
    });
  }
}

export class FirestoreMessageConverter implements FirestoreDataConverter<MessageModel, FirestoreMessageModel> {
  toFirestore(message: WithFieldValue<MessageModel>): WithFieldValue<FirestoreMessageModel> {
    return {
      text: message.text,
      timestamp: isValidDateInput(message.timestamp)
        ? Timestamp.fromDate(new Date(message.timestamp))
        : isFieldValue(message.timestamp)
          ? message.timestamp
          : serverTimestamp(),
      senderId: message.senderId,
      recipientId: message.recipientId
    };
  }

  fromFirestore(snapshot: QueryDocumentSnapshot<FirestoreMessageModel>, options?: SnapshotOptions): MessageModel {
    const data = snapshot.data(options);

    return {
      _id: snapshot.id,
      text: data.text,
      timestamp: data.timestamp.toDate(),
      senderId: data.senderId,
      recipientId: data.recipientId
    };
  }
}