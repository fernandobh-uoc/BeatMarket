import { FieldValue, FirestoreDataConverter, QueryDocumentSnapshot, serverTimestamp, SnapshotOptions, Timestamp, WithFieldValue } from "@angular/fire/firestore";
import { ActivePost, Role, User, UserModel } from "src/app/core/domain/models/user.model";
import { Post, PostModel } from "src/app/core/domain/models/post.model";
import { ArticleCategory, ArticleModel } from "src/app/core/domain/models/article.model";
import { isFieldValue, isFirestoreTimestamp, isValidDateInput } from "./utils/converter.utils";

export interface UserFirestoreModel {
  email: string;
  username: string;
  profilePictureURL: string;
  name: {
    first: string;
    middle?: string;
    last: string;
  };
  //dateOfBirth: Timestamp | null;
  address: {
    line1: string;
    line2?: string;
    city: string;
    country: string;
    zipcode: string;
  };
  roles: string[];
  bio: string;
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
}

export interface ActivePostFirestoreModel {
  title: string;
  category: string;
  price: number;
}

export class UserConverter implements FirestoreDataConverter<UserModel, UserFirestoreModel> {
  toFirestore(user: WithFieldValue<UserModel>): WithFieldValue<UserFirestoreModel> {
    return {
      email: user.email,
      username: user.username,
      profilePictureURL: user.profilePictureURL,
      name: user.name,
      //dateOfBirth: isValidDateInput(user.dateOfBirth) ? Timestamp.fromDate(new Date(user.dateOfBirth as string | number | Date)) : null,
      address: user.address,
      roles: Array.isArray(user.roles)
        ? user.roles.map(role => role.toString())
        : user.roles,
      bio: user.bio,
      createdAt: isValidDateInput(user.createdAt)
        ? Timestamp.fromDate(new Date(user.createdAt))
        : isFieldValue(user.createdAt)
          ? user.createdAt
          : serverTimestamp(),
      updatedAt: isValidDateInput(user.createdAt)
        ? Timestamp.fromDate(new Date(user.createdAt))
        : isFieldValue(user.createdAt)
          ? user.createdAt
          : serverTimestamp(),
    };
  }

  fromFirestore(snapshot: QueryDocumentSnapshot<UserFirestoreModel>, options?: SnapshotOptions): UserModel {
    const data = snapshot.data(options);

    return User.Build({
      _id: snapshot.id,
      email: data.email ?? '',
      username: data.username ?? '',
      profilePictureURL: data.profilePictureURL ?? '',
      name: data.name ?? { first: '', last: '' },
      //dateOfBirth: data?.dateOfBirth?.toDate() ?? null,
      address: data.address ?? {
        line1: '',
        city: '',
        country: '',
        zipcode: ''
      },
      roles: (data.roles ?? []).map(role => role as Role),
      bio: data.bio ?? '',
      createdAt: isFirestoreTimestamp(data.createdAt) 
        ? data.createdAt.toDate() 
        : null,
      updatedAt: isFirestoreTimestamp(data.updatedAt) 
        ? data.updatedAt.toDate() 
        : null
    });
  }
}

export class ActivePostConverter implements FirestoreDataConverter<Partial<PostModel> & Partial<ArticleModel>, ActivePostFirestoreModel> {
  toFirestore(activePost: WithFieldValue<ActivePost>): WithFieldValue<ActivePostFirestoreModel> {
    return {
      title: typeof activePost.title === 'string' ? activePost.title : '',
      category: activePost?.category?.toString() ?? ArticleCategory.None,
      price: typeof activePost.price === 'number' ? activePost.price : 0
    };
  }

  fromFirestore(snapshot: QueryDocumentSnapshot, options?: SnapshotOptions): ActivePost {
    const data = snapshot.data(options);

    const rawCategory = data?.['category'] ?? '';
    const categoryEnumValue = Object.values(ArticleCategory).includes(rawCategory as ArticleCategory)
      ? rawCategory as ArticleCategory
      : ArticleCategory.None;

    return {
      title: data?.['title'] ?? '',
      category: categoryEnumValue,
      price: data?.['price'] ?? 0
    } as ActivePost;
  }
}