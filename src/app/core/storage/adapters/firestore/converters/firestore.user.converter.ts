import { FieldValue, FirestoreDataConverter, QueryDocumentSnapshot, serverTimestamp, SnapshotOptions, Timestamp, WithFieldValue } from "@angular/fire/firestore";
import { ActivePost, Role, User, UserModel } from "src/app/core/domain/models/user.model";
import { PostModel } from "src/app/core/domain/models/post.model";
import { ArticleCategory, ArticleModel } from "src/app/core/domain/models/article.model";
import { isFieldValue, isFirestoreTimestamp, isValidDateInput } from "./utils/converter.utils";

export interface FirestoreUserModel {
  email: string;
  username: string;
  profilePictureURL: string;
  name: {
    first: string;
    middle?: string;
    last: string;
  };
  address: {
    line1: string;
    line2?: string;
    city: string;
    country: string;
    countryCode: string;
    zipcode: string;
  };
  roles: string[];
  bio: string;
  fcmToken: string | null;
  stripeAccountId: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FirestoreActivePostModel {
  title: string;
  category: string;
  price: number;
  mainImageURL: string;
}

export class FirestoreUserConverter implements FirestoreDataConverter<UserModel, FirestoreUserModel> {
  toFirestore(user: WithFieldValue<UserModel>): WithFieldValue<FirestoreUserModel> {
    return {
      email: user.email,
      username: user.username,
      profilePictureURL: user.profilePictureURL,
      name: user.name,
      address: user.address,
      roles: Array.isArray(user.roles)
        ? user.roles.map(role => role.toString())
        : user.roles,
      bio: user.bio,
      fcmToken: user.fcmToken,
      stripeAccountId: user.stripeAccountId,
      createdAt: isValidDateInput(user.createdAt)
        ? Timestamp.fromDate(new Date(user.createdAt))
        : isFieldValue(user.createdAt)
          ? user.createdAt
          : serverTimestamp(),
      updatedAt: isValidDateInput(user.updatedAt)
        ? Timestamp.fromDate(new Date(user.updatedAt))
        : isFieldValue(user.updatedAt)
          ? user.updatedAt
          : serverTimestamp(),
    };
  }

  fromFirestore(snapshot: QueryDocumentSnapshot<FirestoreUserModel>, options?: SnapshotOptions): UserModel {
    const data = snapshot.data(options);

    return User.Build({
      _id: snapshot.id,
      email: data.email ?? '',
      username: data.username ?? '',
      profilePictureURL: data.profilePictureURL ?? '',
      name: data.name ?? { first: '', last: '' },
      address: data.address ?? {
        line1: '',
        city: '',
        country: '',
        countryCode: '',
        zipcode: ''
      },
      roles: (data.roles ?? []).map(role => role as Role),
      bio: data.bio ?? '',
      fcmToken: data.fcmToken,
      stripeAccountId: data.stripeAccountId,
      createdAt: isFirestoreTimestamp(data.createdAt) 
        ? data.createdAt.toDate() 
        : null,
      updatedAt: isFirestoreTimestamp(data.updatedAt) 
        ? data.updatedAt.toDate() 
        : null
    });
  }
}

export class FirestoreActivePostConverter implements FirestoreDataConverter<Partial<PostModel> & Partial<ArticleModel>, FirestoreActivePostModel> {
  toFirestore(activePost: WithFieldValue<ActivePost>): WithFieldValue<FirestoreActivePostModel> {
    return {
      title: typeof activePost.title === 'string' ? activePost.title : '',
      category: activePost?.category?.toString() ?? ArticleCategory.None,
      price: typeof activePost.price === 'number' ? activePost.price : 0,
      mainImageURL: activePost?.mainImageURL ?? ''
    };
  }

  fromFirestore(snapshot: QueryDocumentSnapshot, options?: SnapshotOptions): ActivePost {
    const data = snapshot.data(options);

    const rawCategory = data?.['category'] ?? '';
    const categoryEnumValue = Object.values(ArticleCategory).includes(rawCategory as ArticleCategory)
      ? rawCategory as ArticleCategory
      : ArticleCategory.None;

    return {
      _id: snapshot.id,
      title: data?.['title'] ?? '',
      category: categoryEnumValue,
      price: data?.['price'] ?? 0,
      mainImageURL: data?.['mainImageURL'] ?? ''
    };
  }
}