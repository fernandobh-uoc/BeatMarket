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
  mainImageURL: PostModel["mainImageURL"];
}

export interface SaleUserData {
  userId: UserModel["_id"];
  username: UserModel["username"];
  profilePictureURL: UserModel["profilePictureURL"];
}

export interface SalePaymentData {
  cardName: string;
  cardNumber: string;
  expirationMonth: string;
  expirationYear: string;
  cvc: string;
}

export interface SaleModel extends JSONSerializable<SaleModel>, Timestamps {
  _id: string;
  postData: SalePostData;
  buyerData: SaleUserData;
  sellerData: SaleUserData;
  paymentData: SalePaymentData;
  saleDate: Date;
}

export class Sale implements SaleModel {
  public _id: string = '';
  public postData: { postId: PostModel["_id"], title: PostModel["title"], articleCondition: PostModel["article"]["condition"], price: PostModel["price"], mainImageURL: PostModel["mainImageURL"] } = {
    postId: '',
    title: '',
    articleCondition: ArticleCondition.None,
    price: 0,
    mainImageURL: ''
  };
  public buyerData: { userId: UserModel["_id"], username: UserModel["username"], profilePictureURL: UserModel["profilePictureURL"] } = { userId: '', username: '', profilePictureURL: '' };
  public sellerData: { userId: UserModel["_id"], username: UserModel["username"], profilePictureURL: UserModel["profilePictureURL"] } = { userId: '', username: '', profilePictureURL: '' };
  public paymentData: { cardName: string, cardNumber: string, expirationMonth: string, expirationYear: string, cvc: string } = { cardName: '', cardNumber: '', expirationMonth: '', expirationYear: '', cvc: '' };  
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