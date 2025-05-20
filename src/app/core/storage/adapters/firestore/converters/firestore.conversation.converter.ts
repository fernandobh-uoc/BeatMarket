import { FirestoreDataConverter, QueryDocumentSnapshot, serverTimestamp, SnapshotOptions, Timestamp, WithFieldValue } from "@angular/fire/firestore";
import { Conversation, ConversationModel, ParticipantModel } from "src/app/core/domain/models/conversation.model";
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
    initiator: {
      participantId: string;
      username: string;
      profilePictureURL: string;
    },
    recipient: {
      participantId: string;
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
  status: string;
}

export class FirestoreConversationConverter implements FirestoreDataConverter<ConversationModel, FirestoreConversationModel> {
  toFirestore(conversation: WithFieldValue<ConversationModel>): WithFieldValue<FirestoreConversationModel> {
    return {
      relatedPost: conversation.relatedPost,
      participants: isFieldValue(conversation.participants)
        ? conversation.participants
        : {
          initiator: {
            participantId: (conversation.participants as { initiator: ParticipantModel; recipient: ParticipantModel }).initiator.userId,
            username: (conversation.participants as { initiator: ParticipantModel; recipient: ParticipantModel }).initiator.username,
            profilePictureURL: (conversation.participants as { initiator: ParticipantModel; recipient: ParticipantModel }).initiator.profilePictureURL
          },
          recipient: {
            participantId: (conversation.participants as { initiator: ParticipantModel; recipient: ParticipantModel }).recipient.userId,
            username: (conversation.participants as { initiator: ParticipantModel; recipient: ParticipantModel }).recipient.username,
            profilePictureURL: (conversation.participants as { initiator: ParticipantModel; recipient: ParticipantModel }).recipient.profilePictureURL
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
        initiator: {
          userId: data.participants.initiator.participantId,
          username: data.participants.initiator.username,
          profilePictureURL: data.participants.initiator.profilePictureURL
        },
        recipient: {
          userId: data.participants.recipient.participantId,
          username: data.participants.recipient.username,
          profilePictureURL: data.participants.recipient.profilePictureURL
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