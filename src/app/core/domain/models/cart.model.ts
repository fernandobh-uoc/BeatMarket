import { JSONSerializable } from "../../interfaces/jsonserializable.interface";
import { PostModel } from "./post.model";
import { UserModel } from "./user.model";

interface CartItem {
  postId: PostModel["_id"],
  title: PostModel["title"],
  price: PostModel["price"],
  shipping: PostModel["shipping"],
}

export interface CartModel extends JSONSerializable<CartModel> {
  _id: string;
  userId: UserModel["_id"];
  items: CartItem[]; // Map (should not be excessively large)
}

export class Cart implements CartModel {
  public _id: string = '';
  public userId: UserModel["_id"] = '';
  public items: CartItem[] = [];

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