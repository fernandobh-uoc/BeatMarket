import { FirestoreDataConverter, QueryDocumentSnapshot, serverTimestamp, SnapshotOptions, Timestamp, WithFieldValue } from "firebase/firestore";
import { Cart, CartModel } from "src/app/core/domain/models/cart.model";
import { isValidDateInput, isFieldValue, isFirestoreTimestamp } from "./utils/converter.utils";

export interface FirestoreCartModel {
  userId: string;
  items: {
    postId: string;
    title: string;
    price: number;
    shipping: number;
    mainImageURL: string;
  }[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export class FirestoreCartConverter implements FirestoreDataConverter<CartModel, FirestoreCartModel> {
  toFirestore(cart: WithFieldValue<CartModel>): WithFieldValue<FirestoreCartModel> {
    return {
      userId: cart.userId,
      items: cart.items,
      /* items: (cart.items as CartItemModel[]).map(item => ({
        postId: item.postId,
        title: item.title,
        price: item.price,
        shipping: item.shipping,
        mainImageURL: item.mainImageURL
      })), */
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

  fromFirestore(snapshot: QueryDocumentSnapshot<FirestoreCartModel>, options?: SnapshotOptions): CartModel {
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
