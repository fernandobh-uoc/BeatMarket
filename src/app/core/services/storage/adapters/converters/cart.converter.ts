import { FirestoreDataConverter, QueryDocumentSnapshot, serverTimestamp, SnapshotOptions, Timestamp, WithFieldValue } from "firebase/firestore";
import { Cart, CartItem, CartModel } from "src/app/core/domain/models/cart.model";
import { isValidDateInput, isFieldValue, isFirestoreTimestamp } from "./utils/converter.utils";

export interface CartFirestoreModel {
  userId: string;
  items: {
    postId: string;
    title: string;
    price: number;
    shipping: number;
  }[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export class CartConverter implements FirestoreDataConverter<CartModel, CartFirestoreModel> {
  toFirestore(cart: WithFieldValue<CartModel>): WithFieldValue<CartFirestoreModel> {
    return {
      userId: cart.userId,
      items: (cart.items as CartItem[]).map(item => ({
        postId: item.postId,
        title: item.title,
        price: item.price,
        shipping: item.shipping
      })),
      createdAt: isValidDateInput(cart.createdAt)
        ? Timestamp.fromDate(new Date(cart.createdAt))
        : isFieldValue(cart.createdAt)
          ? cart.createdAt
          : serverTimestamp(),
      updatedAt: isValidDateInput(cart.updatedAt)
        ? Timestamp.fromDate(new Date(cart.updatedAt))
        : isFieldValue(cart.updatedAt)
          ? cart.updatedAt
          : serverTimestamp(),
    };
  }

  fromFirestore(snapshot: QueryDocumentSnapshot<CartFirestoreModel>, options?: SnapshotOptions): CartModel {
    const data = snapshot.data(options);

    return Cart.Build({
      _id: snapshot.id,
      userId: data.userId ?? '',
      items: data.items ?? [],
      createdAt: isFirestoreTimestamp(data.createdAt) 
        ? data.createdAt.toDate() 
        : null,
      updatedAt: isFirestoreTimestamp(data.updatedAt) 
        ? data.updatedAt.toDate() 
        : null
    });
  }
}
