import { JSONSerializable } from "../../interfaces/jsonserializable.interface";
import { Timestamps } from "./appModel.type";
import { PostModel } from "./post.model";
import { UserModel } from "./user.model";

export interface CartItemModel {
  postId: PostModel["_id"],
  title: PostModel["title"],
  price: PostModel["price"],
  shipping: number,
  mainImageURL: PostModel["mainImageURL"]
}

export interface CartModel extends JSONSerializable<CartModel>, Timestamps {
  _id: string;
  userId: UserModel["_id"] | string;
  items: CartItemModel[];   // Map (should not be excessively large)
}

export class Cart implements CartModel {
  public _id: string = '';
  public userId: UserModel["_id"] = '';
  public items: CartItemModel[] = [];

  private constructor(cart: Partial<CartModel> = {}) {
    Object.assign(this, { ...cart });
  }

  static Build(cart: Partial<CartModel> = {}): Cart {
    return new Cart(cart);
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

  public fromJSON(json: string): Cart | null {
    try {
      const obj = JSON.parse(json);
      return obj as Cart;
    } catch (error) {
      console.error(`Error parsing json ${json}: ${error}`);
    }
    return null;
  }
}

export function isCartModel(obj: any): obj is CartModel {
  return typeof obj === 'object' &&
    obj !== null &&
    typeof obj._id === 'string' &&
    typeof obj.userId === 'string' &&
    Array.isArray(obj.items);
}

export function isCartItemModel(obj: any): obj is CartItemModel {
  return typeof obj === 'object' &&
    obj !== null &&
    typeof obj.postId === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.price === 'number' &&
    typeof obj.shipping === 'number' &&
    typeof obj.mainImageURL === 'string';
}