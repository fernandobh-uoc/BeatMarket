import { DocumentData, FirestoreDataConverter, QueryDocumentSnapshot, serverTimestamp, SnapshotOptions, Timestamp, WithFieldValue } from "firebase/firestore";
import { Sale, SaleModel, SalePostData, SaleUserData } from "src/app/core/domain/models/sale.model";
import { isFieldValue, isFirestoreTimestamp, isValidDateInput } from "./utils/converter.utils";
import { FirestoreSaleRepository } from "src/app/core/storage/adapters/firestore/repositories/firestore.sale.repository";
import { ArticleCondition } from "src/app/core/domain/models/article.model";

export interface FirestoreSaleModel {
  postData: {
    postId: string;
    title: string;
    articleCondition: string;
    price: number;
    mainImageURL: string;
  };
  buyerData: {
    userId: string;
    username: string;
    profilePictureURL: string;
  };
  sellerData: {
    userId: string;
    username: string;
    profilePictureURL: string;
  };
  stripePaymentId: string;
  createdAt: Timestamp,
  updatedAt: Timestamp;
}

export class FirestoreSaleConverter implements FirestoreDataConverter<SaleModel, FirestoreSaleModel> {
  toFirestore(sale: WithFieldValue<SaleModel>): WithFieldValue<FirestoreSaleModel> {
    return {
      postData: sale.postData,
      /* postData: {
        postId: (<SalePostData>sale.postData).postId,
        title: (<SalePostData>sale.postData).title,
        articleCondition: (<SalePostData>sale.postData).articleCondition,
        price: (<SalePostData>sale.postData).price,
      } */
      buyerData: sale.buyerData,
      /* buyerData: {
        userId: (<SaleUserData>sale.buyerData).userId,
        username: (<SaleUserData>sale.buyerData).username,
      }, */
      sellerData: sale.sellerData,
      /* sellerData: {
        userId: (<SaleUserData>sale.sellerData).userId,
        username: (<SaleUserData>sale.sellerData).username,
      }, */
      stripePaymentId: sale.stripePaymentId,
      createdAt: isValidDateInput(sale.createdAt)
        ? Timestamp.fromDate(new Date(sale.createdAt))
        : isFieldValue(sale.createdAt)
          ? sale.createdAt
          : serverTimestamp(),
      updatedAt: isValidDateInput(sale.updatedAt)
        ? Timestamp.fromDate(new Date(sale.updatedAt))
        : isFieldValue(sale.updatedAt)
          ? sale.updatedAt
          : serverTimestamp()
    }
  }

  fromFirestore(snapshot: QueryDocumentSnapshot<FirestoreSaleModel>, options?: SnapshotOptions): SaleModel {
    const data = snapshot.data(options);

    return Sale.Build({
      _id: snapshot.id,
      postData: {
        postId: data.postData.postId,
        title: data.postData.title,
        articleCondition: data.postData.articleCondition as ArticleCondition,
        price: data.postData.price,
        mainImageURL: data.postData.mainImageURL,
      },
      buyerData: {
        userId: data.buyerData.userId,
        username: data.buyerData.username,
        profilePictureURL: data.buyerData.profilePictureURL,
      },
      sellerData: {
        userId: data.sellerData.userId,
        username: data.sellerData.username,
        profilePictureURL: data.sellerData.profilePictureURL,
      },
      stripePaymentId: data.stripePaymentId,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate()
    });
  }
}