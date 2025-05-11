import { FirestoreDataConverter, QueryDocumentSnapshot, serverTimestamp, SnapshotOptions, Timestamp, WithFieldValue } from "firebase/firestore";
import { ArticleCategory, ArticleCondition, ArticleModel, isArticleModel } from "src/app/core/domain/models/article.model";
import { Post, PostModel, PostStatus, PostUserData } from "src/app/core/domain/models/post.model";
import { isInstrumentCharacteristics, isBookCharacteristics, isRecordingCharacteristics, isAccessoryCharacteristics, isProfessionalCharacteristics, ArticleCharacteristics, InstrumentCharacteristics, BookCharacteristics, RecordingCharacteristics, AccessoryCharacteristics, ProfessionalCharacteristics, OtherCharacteristics, isNoneCharacteristics, isOtherCharacteristics } from "src/app/core/domain/models/articleCharacteristics.interface";
import { isFieldValue, isFirestoreTimestamp, isValidDateInput } from "./utils/converter.utils";
import { parseFormattedCurrency } from "src/app/shared/utils/currencyParser.service";

export interface FirestorePostModel {
  title: string;
  description: string;
  mainImageURL: string;
  imagesURLs: string[];
  user: {
    userId: string;
    username: string;
    profilePictureURL: string;
  },
  price: number;
  //shipping: number;
  status: string;
  finishedAt: Timestamp | null;
  article: {
    category: string;
    condition: string;
    characteristics: {
      // Instrument
      type?: string;
      brand?: string;
      model?: string;
      color?: string;
      fabricationYear?: string;
      serialNumber?: string;
      accessories?: string[];
      instrumentLevel?: string;

      // Recording
      format?: string;
      title?: string;
      artist?: string;
      genre?: string;
      year?: string;
      duration?: string;
      label?: string;
      catalogNumber?: string;
      isrc?: string;
      barcode?: string;
      releaseDate?: string;
      releaseCountry?: string;
      releaseFormat?: string;
      trackCount?: string;
      trackNumber?: string;

      // Accessory
      name?: string;
      associatedInstrument?: string;

      // Book
      author?: string;
      theme?: string;
      edition?: string;
      publisher?: string;
      pages?: number;
      language?: string;
      isbn?: string;
      series?: string;
      volume?: string;

      // Professional
      warranty?: string;
      warrantyDuration?: string;
      warrantyType?: string;
      warrantyDate?: string;
      warrantyCountry?: string;
    }
  },
  createdAt: Timestamp,
  updatedAt: Timestamp;
}

export class FirestorePostConverter implements FirestoreDataConverter<PostModel, FirestorePostModel> {
  toFirestore(post: WithFieldValue<PostModel>): WithFieldValue<FirestorePostModel> {
    let article: Partial<ArticleModel> = post.article as Partial<ArticleModel>;

    let category: string = ArticleCategory.None;
    let characteristics: any = { category: ArticleCategory.None };
    if (isArticleModel(article)) {
      category = article.category;
      const c = article.characteristics;

      if (isInstrumentCharacteristics(c, category)) {
        characteristics = {
          type: c.type,
          brand: c.brand,
          model: c.model,
          color: c.color,
          fabricationYear: c.fabricationYear,
          serialNumber: c.serialNumber,
          instrumentLevel: c.instrumentLevel,
        }
      } else if (isBookCharacteristics(c, category)) {
        characteristics = {
          author: c.author,
          theme: c.theme,
          edition: c.edition,
          publisher: c.publisher,
          year: c.year,
          pages: c.pages,
          language: c.language,
          isbn: c.isbn,
          series: c.series,
          volume: c.volume,
        }
      } else if (isRecordingCharacteristics(c, category)) {
        characteristics = {
          format: c.format,
          recordingTitle: c.recordingTitle,
          artist: c.artist,
          genre: c.genre,
          year: c.year,
          duration: c.duration,
          label: c.label,
          catalogNumber: c.catalogNumber,
          isrc: c.isrc,
          barcode: c.barcode,
          releaseDate: c.releaseDate,
          releaseCountry: c.releaseCountry,
          releaseFormat: c.releaseFormat,
          trackCount: c.trackCount,
        }
      } else if (isAccessoryCharacteristics(c, category)) {
        characteristics = {
          name: c.name,
          brand: c.brand,
          associatedInstrument: c.associatedInstrument,
        }
      } else if (isProfessionalCharacteristics(c, category)) {
        characteristics = {
          name: c.name,
          brand: c.brand,
          model: c.model,
          color: c.color,
          fabricationYear: c.fabricationYear,
          serialNumber: c.serialNumber,
          accessories: c.accessories,
          warranty: c.warranty,
          warrantyDuration: c.warrantyDuration,
          warrantyType: c.warrantyType,
        }
      } else if (isOtherCharacteristics(c, category)) {
        characteristics = {
          description: c.description
        }
      }
      
      /* if (category === ArticleCategory.Instruments) {
        characteristics = c as InstrumentCharacteristics;
      } else if (category === ArticleCategory.Books) {
        characteristics = c as BookCharacteristics;
      } else if (category === ArticleCategory.Recordings) {
        characteristics = c as RecordingCharacteristics;
      } else if (category === ArticleCategory.Accessories) {
        characteristics = c as AccessoryCharacteristics;
      } else if (category === ArticleCategory.Professional) {
        characteristics = c as ProfessionalCharacteristics;
      } else if (category === ArticleCategory.Other) {
        characteristics = c as OtherCharacteristics;
      } */

      /* if (isInstrumentCharacteristics(c)) {
        characteristics = {
          type: c.type,
          brand: c.brand,
          model: c.model,
          color: c.color,
          fabricationYear: c.fabricationYear,
          serialNumber: c.serialNumber,
          instrumentLevel: c.instrumentLevel,
        }
      } else if (isBookCharacteristics(c)) {
        characteristics = {
          author: c.author,
          theme: c.theme,
          edition: c.edition,
          publisher: c.publisher,
          year: c.year,
          pages: c.pages,
          language: c.language,
          isbn: c.isbn,
          series: c.series,
          volume: c.volume,
        }
      } else if (isRecordingCharacteristics(c)) {
        characteristics = {
          format: c.format,
          recordingTitle: c.recordingTitle,
          artist: c.artist,
          genre: c.genre,
          year: c.year,
          duration: c.duration,
          label: c.label,
          catalogNumber: c.catalogNumber,
          isrc: c.isrc,
          barcode: c.barcode,
          releaseDate: c.releaseDate,
          releaseCountry: c.releaseCountry,
          releaseFormat: c.releaseFormat,
          trackCount: c.trackCount,
          trackNumber: c.trackNumber,
        }
      } else if (isAccessoryCharacteristics(c)) {
        characteristics = {
          name: c.name,
          brand: c.brand,
          associatedInstrument: c.associatedInstrument,
        }
      } else if (isProfessionalCharacteristics(c)) {
        characteristics = {
          name: c.name,
          brand: c.brand,
          model: c.model,
          color: c.color,
          fabricationYear: c.fabricationYear,
          serialNumber: c.serialNumber,
          accessories: c.accessories,
          warranty: c.warranty,
          warrantyDuration: c.warrantyDuration,
          warrantyType: c.warrantyType,
          warrantyDate: c.warrantyDate,
          warrantyCountry: c.warrantyCountry,
        }
      } */
    }

    return {
      title: post.title,
      description: post.description,
      mainImageURL: post.mainImageURL,
      imagesURLs: post.imagesURLs,
      user: post.user,
      /* user: {
        userId: (<PostUserData>post.user).userId,
        username: (<PostUserData>post.user).username,
        profilePictureURL: (<PostUserData>post.user).profilePictureURL,
      }, */
      price: post.price,
      //shipping: post.shipping,
      status: post.status,
      finishedAt: isValidDateInput(post.finishedAt) 
        ? Timestamp.fromDate(new Date(post.finishedAt)) 
        : isFieldValue(post.finishedAt)
          ? post.finishedAt
          : null,
      article: {
        category,
        condition: (<Partial<ArticleModel>>post.article).condition ?? '',
        characteristics: { ...characteristics }
      },
      createdAt: isValidDateInput(post.createdAt)
        ? Timestamp.fromDate(new Date(post.createdAt))
        : isFieldValue(post.createdAt)
          ? post.createdAt
          : serverTimestamp(),
      updatedAt: isValidDateInput(post.updatedAt)
        ? Timestamp.fromDate(new Date(post.updatedAt))
        : isFieldValue(post.updatedAt)
          ? post.updatedAt
          : serverTimestamp(),
    }
  }

  fromFirestore(snapshot: QueryDocumentSnapshot<FirestorePostModel>, options?: SnapshotOptions): PostModel {
    const data = snapshot.data(options);

    return Post.Build({
      _id: snapshot.id,
      title: data.title,
      description: data.description,
      mainImageURL: data.mainImageURL,
      imagesURLs: data.imagesURLs,
      user: data.user,
      price: data.price,
      //shipping: data.shipping ?? 0,
      status: Object.values(PostStatus).includes(data.status as PostStatus) 
        ? (data.status as PostStatus)
        : PostStatus.Active,
      finishedAt: isFirestoreTimestamp(data.finishedAt) 
        ? data.finishedAt.toDate() 
        : null,
      article: {
        category: data.article.category as ArticleCategory,
        condition: data.article.condition as ArticleCondition,
        characteristics: data.article.characteristics as ArticleCharacteristics
      },
      createdAt: isFirestoreTimestamp(data.createdAt) 
        ? data.createdAt.toDate() 
        : null,
      updatedAt: isFirestoreTimestamp(data.updatedAt)
        ? data.updatedAt.toDate()
        : null
    });
  }
}
