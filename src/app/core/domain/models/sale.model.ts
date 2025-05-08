import { JSONSerializable } from "../../interfaces/jsonserializable.interface";
import { PostModel } from "./post.model";
import { UserModel } from "./user.model";
import { ArticleCondition } from "./article.model";
import { Timestamps } from "./appModel.type";

export interface SalePostData {
  postId: PostModel["_id"];
  title: PostModel["title"];
  articleCondition: PostModel["article"]["condition"];
  price: PostModel["price"];
}

export interface SaleUserData {
  userId: UserModel["_id"];
  username: UserModel["username"];
}

export interface SaleModel extends JSONSerializable<SaleModel>, Timestamps {
  _id: string;
  postData: SalePostData;
  buyerData: SaleUserData;
  sellerData: SaleUserData;
  saleDate: Date;
}

export class Sale implements SaleModel {
  public _id: string = '';
  public postData: { postId: PostModel["_id"], title: PostModel["title"], articleCondition: PostModel["article"]["condition"], price: PostModel["price"] } = {
    postId: '',
    title: '',
    articleCondition: ArticleCondition.None,
    price: 0
  };
  public buyerData: { userId: UserModel["_id"], username: UserModel["username"] } = { userId: '', username: '' };
  public sellerData: { userId: UserModel["_id"], username: UserModel["username"] } = { userId: '', username: '' };
  public saleDate: Date = new Date();

  private constructor(sale: Partial<SaleModel> = {}) {
    Object.assign(this, { ...sale });
  }

  static Build(sale: Partial<SaleModel> = {}): SaleModel {
    return new Sale(sale);
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

  public fromJSON(json: string): SaleModel | null {
    try {
      const obj = JSON.parse(json);
      return obj as SaleModel;
    } catch (error) {
      console.error(`Error parsing json ${json}: ${error}`);
    }
    return null;
  }
}