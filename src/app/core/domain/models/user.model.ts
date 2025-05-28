import { JSONSerializable } from "../../interfaces/jsonserializable.interface"; 
import { Timestamps } from "./appModel.type";
import { ArticleCategory, ArticleModel } from "./article.model";
import { PostModel } from "./post.model";

interface FullName {
  first: string,
  middle?: string,
  last: string
}

interface Address {
  line1: string,
  line2?: string,
  city: string,
  country: string,
  countryCode: string,
  zipcode: string
}

export enum Role {
  None = '',
  Amateur = 'Aficionado',
  Professional = 'Profesional',
  Collector = 'Coleccionista',
  Student = 'Estudiante'
}

export interface ActivePost {
  _id: string;
  title: string;
  category: ArticleCategory;
  price: number;
  mainImageURL: string;
}

export interface UserModel extends JSONSerializable<UserModel>, Timestamps {
  _id: string;
  email: string;
  username: string;
  profilePictureURL: string;
  name: FullName;
  address: Address;
  roles: Role[];
  bio: string;

  activePosts: ActivePost[]; // Subcollection

  fcmToken: string | null;
  stripeAccountId: string | null;

  providerId?: string;
  providerData?: Array<{
    providerId: string;
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
  }>;
}

export class User implements UserModel {
  public _id: string = '';
  public email: string = '';
  public username: string = '';
  public profilePictureURL: string = '';
  public name: FullName = { first: '', middle: '', last: '' };
  public address: Address = { line1: '', city: '', country: '', countryCode: '', zipcode: '' };
  public roles: Role[] = [];
  public bio: string = '';
  public activePosts: ActivePost[] = [];
  public fcmToken: string | null = '';
  public stripeAccountId: string | null = '';

  private constructor(user: Partial<UserModel> = {}) {
    Object.assign(this, { ...user });
  }

  static Build(user: Partial<UserModel> = {}): User {
    return new User(user);
  }

  public get fullName(): string {
    if (!this.name) {
      return '';
    }
    if (this.name.middle) {
      return `${this.name.first} ${this.name.middle} ${this.name.last}`;
    }
    return `${this.name.first} ${this.name.last}`;
  }

  public toJSON(): string {
    const serialized = Object.assign(this);
    delete serialized._id;
    delete serialized.fullName;
    try {
      const jsonStr = JSON.stringify(serialized);
      return jsonStr;
    } catch (error) {
      console.error(`Error stringifying object ${serialized}: ${error}`)
    }
    return '';
  }

  public fromJSON(json: string): UserModel | null {
    try {
      const obj = JSON.parse(json);
      return obj as User;
    } catch (error) {
      console.error(`Error parsing json ${json}: ${error}`);
    }
    return null;
  }
}

export function isUserModel(obj: any): obj is UserModel {
  return typeof obj === 'object' &&
    obj !== null &&
    typeof obj._id === 'string' &&
    typeof obj.email === 'string' &&
    typeof obj.username === 'string' &&
    typeof obj.profilePictureURL === 'string' &&
    Array.isArray(obj.roles);
}