import { FirestoreDataConverter, QueryDocumentSnapshot, serverTimestamp, SnapshotOptions, Timestamp, WithFieldValue } from "firebase/firestore";
import { ArticleCategory, ArticleCondition, ArticleModel, isArticleModel } from "src/app/core/domain/models/article.model";
import { Post, PostModel, PostStatus } from "src/app/core/domain/models/post.model";
import { isInstrumentCharacteristics, isBookCharacteristics, isRecordingCharacteristics, isAccessoryCharacteristics, isProfessionalCharacteristics, ArticleCharacteristics, InstrumentCharacteristics } from "src/app/core/domain/models/articleCharacteristics.interface";
import { UserModel } from "src/app/core/domain/models/user.model";
import { isFieldValue, isFirestoreTimestamp, isValidDateInput } from "./utils/converter.utils";

export interface PostFirestoreModel {
  postId: string;
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
  shipping: number;
  status: string;
  finishedAt: Timestamp | null;
  article: {
    name: string;
    category: string;
    condition: string;
    characteristics: {
      category: string;

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

export class PostConverter implements FirestoreDataConverter<PostModel, PostFirestoreModel> {
  toFirestore(post: WithFieldValue<PostModel>): WithFieldValue<PostFirestoreModel> {
    let { user, article } = post;
    user = user as Partial<UserModel>;
    article = article as Partial<ArticleModel>;

    let category: string = ArticleCategory.None;
    let characteristics: any = { category: ArticleCategory.None };
    if (isArticleModel(article)) {
      category = article.category;
      const c = article.characteristics;

      if (isInstrumentCharacteristics(c)) {
        characteristics = {
          category,
          type: c.type,
          brand: c.brand,
          model: c.model,
          color: c.color,
          fabricationYear: c.fabricationYear,
          serialNumber: c.serialNumber,
          accessories: c.accessories,
          instrumentLevel: c.instrumentLevel,
        }
      } else if (isBookCharacteristics(c)) {
        characteristics = {
          category,
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
          category,
          format: c.format,
          title: c.title,
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
          category,
          name: c.name,
          brand: c.brand,
          associatedInstrument: c.associatedInstrument,
        }
      } else if (isProfessionalCharacteristics(c)) {
        characteristics = {
          category,
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
      }
    }

    return {
      postId: post._id,
      title: post.title,
      description: post.description,
      mainImageURL: post.mainImageURL,
      imagesURLs: post.imagesURLs,
      user: {
        userId: user._id ?? '',
        username: user.username ?? '',
        profilePictureURL: user.profilePictureURL ?? '',
      },
      price: post.price,
      shipping: post.shipping,
      status: post.status,
      finishedAt: isValidDateInput(post.finishedAt) 
        ? Timestamp.fromDate(new Date(post.finishedAt)) 
        : isFieldValue(post.finishedAt)
          ? post.finishedAt
          : serverTimestamp(),
      article: {
        name: article.name ?? '',
        category,
        condition: article.condition ?? '',
        characteristics
      },
      createdAt: isValidDateInput(post.createdAt)
        ? Timestamp.fromDate(new Date(post.createdAt))
        : isFieldValue(post.createdAt)
          ? post.createdAt
          : serverTimestamp(),
      updatedAt: isValidDateInput(post.createdAt)
        ? Timestamp.fromDate(new Date(post.createdAt))
        : isFieldValue(post.createdAt)
          ? post.createdAt
          : serverTimestamp(),
    }
  }

  fromFirestore(snapshot: QueryDocumentSnapshot<PostFirestoreModel>, options?: SnapshotOptions): PostModel {
    const data = snapshot.data(options);

    return Post.Build({
      _id: snapshot.id,
      title: data.title ?? '',
      description: data.description ?? '',
      mainImageURL: data.mainImageURL ?? '',
      imagesURLs: data.imagesURLs ?? [],
      user: data.user ?? {},
      price: data.price ?? 0,
      shipping: data.shipping ?? 0,
      status: Object.values(PostStatus).includes(data.status as PostStatus) 
        ? (data.status as PostStatus)
        : PostStatus.Active,
      finishedAt: isFirestoreTimestamp(data.finishedAt) 
        ? data.finishedAt.toDate() 
        : null,
      article: {
        name: data.article.name,
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