import { JSONSerializable } from "../../interfaces/jsonserializable.interface"; 
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
  zipcode: string
}

/* interface ActivePost {
  postId: PostModel["_id"];
  title: PostModel["title"];
  category: PostModel["product"]["category"];
  price: PostModel["price"];
} */

export enum Role {
  None = '',
  Amateur = 'Aficionado',
  Professional = 'Profesional',
  Collector = 'Coleccionista',
  Student = 'Estudiante'
}

export interface UserModel extends JSONSerializable<UserModel> {
  _id: string;
  email: string;
  username: string;
  profilePictureURL: string;
  name: FullName;
  dateOfBirth: Date | number | null;
  address: Address;
  roles: Role[];
  bio: string;
  createdAt?: Date | number | null;
  updatedAt?: Date | number | null;

  activePosts: Partial<PostModel>[]; // Subcollection

  /* boughtPosts: PostModel[] | string[];
  soldPosts: PostModel[] | string[]; */

  //messages: Partial<MessageModel>[] | string[];

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
  public dateOfBirth: Date | number | null = null;
  public address: Address = { line1: '', city: '', country: '', zipcode: '' };
  public roles: Role[] = [];
  public bio: string = '';
  public createdAt?: Date | number | null = new Date();
  public updatedAt?: Date | number | null = new Date();
  public activePosts: Partial<PostModel>[] = [];

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