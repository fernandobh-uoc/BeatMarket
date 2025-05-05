import { JSONSerializable } from "../../interfaces/jsonserializable.interface";
import { UserModel } from "./user.model";
import { ArticleModel } from "./article.model";
import { Timestamps } from "./appModel.type";

export enum PostStatus {
  Active = 'active',
  Finished = 'finished'
}

export interface PostModel extends JSONSerializable<PostModel>, Timestamps {
  _id: string;
  title: string;
  description: string;
  mainImageURL: string;
  imagesURLs: string[];
  user: Partial<UserModel>;
  price: number;
  shipping: number;
  status: PostStatus;
  finishedAt: Date | null;
  article: Partial<ArticleModel>;
}

export class Post implements PostModel {
  public _id: string = '';
  public title: string = '';
  public description: string = '';
  public mainImageURL: string = '';
  public imagesURLs: string[] = [];
  public user: Partial<UserModel> = {};
  public price: number = 0;
  public shipping: number = 0;
  public status: PostStatus = PostStatus.Active;
  public finishedAt: Date | null = null;
  public article: Partial<ArticleModel> = {};

  private constructor(post: Partial<PostModel> = {}) {
    Object.assign(this, { ...post });
  }

  static Build(post: Partial<PostModel> = {}): Post {
    return new Post(post);
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

  public fromJSON(json: string): PostModel | null {
    try {
      const obj = JSON.parse(json);
      return obj as Post;
    } catch (error) {
      console.error(`Error parsing json ${json}: ${error}`);
    }
    return null;
  }
}

export function isPostModel(obj: any): obj is PostModel {
  return typeof obj === 'object' &&
    obj !== null &&
    typeof obj._id === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.description === 'string' &&
    typeof obj.mainImageURL === 'string' &&
    Array.isArray(obj.imagesURLs) &&
    typeof obj.user === 'object' &&
    typeof obj.price === 'number' &&
    typeof obj.shipping === 'number' &&
    typeof obj.status === 'string' &&
    typeof obj.article === 'object' &&
    typeof obj.createdAt === 'object' &&
    typeof obj.updatedAt === 'object';
}