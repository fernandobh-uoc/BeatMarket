import { FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions, Timestamp, WithFieldValue } from "@angular/fire/firestore";
import { Role, User, UserModel } from "src/app/core/domain/models/user.model";
import { Post, PostModel } from "src/app/core/domain/models/post.model";
import { ArticleCategory, ArticleModel } from "src/app/core/domain/models/article.model";

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
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ActivePostFirestoreModel {
  title: string;
  category: string;
  price: number;
}

export function isValidDateInput(val: unknown): val is string | number | Date {
  return (
    typeof val === 'string' ||
    typeof val === 'number' ||
    val instanceof Date
  );
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
        : Timestamp.now(),
      updatedAt: isValidDateInput(user.updatedAt)
        ? Timestamp.fromDate(new Date(user.updatedAt))
        : Timestamp.now()
    };
  }

  fromFirestore(snapshot: QueryDocumentSnapshot<UserFirestoreModel>, options?: SnapshotOptions): UserModel {
    const data = snapshot.data(options);

    return User.Build({
      _id: snapshot.id,
      email: data?.email ?? '',
      username: data?.username ?? '',
      profilePictureURL: data?.profilePictureURL ?? '',
      name: data?.name ?? { first: '', last: '' },
      //dateOfBirth: data?.dateOfBirth?.toDate() ?? null,
      address: data?.address ?? {
        line1: '',
        city: '',
        country: '',
        zipcode: ''
      },
      roles: (data?.roles ?? []).map(role => role as Role),
      bio: data?.bio ?? '',
      createdAt: data?.createdAt?.toDate() ?? null,
      updatedAt: data?.updatedAt?.toDate() ?? null
    });
  }
}

export class ActivePostConverter implements FirestoreDataConverter<Partial<PostModel> & Partial<ArticleModel>, ActivePostFirestoreModel> {
  toFirestore(activePost: WithFieldValue<Partial<PostModel> & Partial<ArticleModel>>): WithFieldValue<ActivePostFirestoreModel> {
    return {
      title: typeof activePost.title === 'string' ? activePost.title : '',
      category: activePost?.category?.toString() ?? ArticleCategory.None,
      price: typeof activePost.price === 'number' ? activePost.price : 0
    };
  }

  fromFirestore(snapshot: QueryDocumentSnapshot, options?: SnapshotOptions): Partial<PostModel> & Partial<ArticleModel> {
    const data = snapshot.data(options);

    const rawCategory = data?.['category'] ?? '';
    const categoryEnumValue = Object.values(ArticleCategory).includes(rawCategory as ArticleCategory)
      ? rawCategory as ArticleCategory
      : ArticleCategory.None;

    return {
      title: data?.['title'] ?? '',
      category: categoryEnumValue,
      price: data?.['price'] ?? 0
    } as Partial<PostModel> & Partial<ArticleModel>;
  }
}