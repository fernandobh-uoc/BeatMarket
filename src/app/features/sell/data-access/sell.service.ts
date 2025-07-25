import { computed, inject, Injectable, signal } from '@angular/core';
import { Post, PostModel } from 'src/app/core/domain/models/post.model';
import { PostRepository } from 'src/app/core/domain/repositories/post.repository';
import { Camera, CameraResultType } from '@capacitor/camera';
import { images } from 'ionicons/icons';
import { environment } from 'src/environments/environment.dev';
import { dataUrlToBlob } from 'src/app/shared/utils/file.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { UserRepository } from 'src/app/core/domain/repositories/user.repository';
import { ActivePost, User, UserModel } from 'src/app/core/domain/models/user.model';
import { ArticleCategory, ArticleModel } from 'src/app/core/domain/models/article.model';
import { CloudStorage } from 'src/app/core/services/cloud-storage/cloudStorage.interface';
import { parseFormattedCurrency } from 'src/app/shared/utils/currencyParser.service';


type SellState = {
  imagesDataURLs: string[],
  latestPublishedPostId: string,
  loading: boolean,
  errorMessage: string
}

@Injectable({
  providedIn: 'root'
})
export class SellService {
  private authService = inject(AuthService);
  private postRepository = inject(PostRepository);
  private userRepository = inject(UserRepository);
  private cloudStorage = inject(CloudStorage);

  private imagesDataURLs = signal<string[]>([]);
  private latestPublishedPostId = signal<string>(''); // For retrieval from splash page
  private loading = signal<boolean>(false);
  private errorMessage = signal<string>('');

  sellState = computed<SellState>(() => ({
    imagesDataURLs: this.imagesDataURLs(),
    latestPublishedPostId: this.latestPublishedPostId(),
    loading: this.loading(),
    errorMessage: this.errorMessage()
  }));

  constructor() { }

  loadImages = async (): Promise<string[]> => {
    const result = await Camera.pickImages({
      quality: 80,
      limit: 10
    });

    const dataUrls = await Promise.all(
      result.photos.map(async (photo) => {
        const response = await fetch(photo.webPath);
        const blob = await response.blob();
        return await this.#convertBlobToDataURL(blob);
      })
    )

    this.imagesDataURLs.set(dataUrls);
    return this.imagesDataURLs();
  }

  loadImagesNotNative = async (event: any): Promise<void> => {
    const input = event.target as HTMLInputElement;

    if (!input.files) return;

    const files = Array.from(input.files);
    const promises = files.map(async file => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        resolve(dataUrl);
      };
      reader.onerror = () => {
        reject(new Error('Error al leer el archivo'));
      };
      reader.readAsDataURL(file);
    }))

    try {
      const imageDataURLs = await Promise.all(promises);
      this.imagesDataURLs.set(imageDataURLs as string[]);
    } catch (error) {
      console.error(error);
    }
  }

  removeImages = async (): Promise<void> => {
    this.imagesDataURLs.set([]);
  }

  publishPost = async (postFormData: any): Promise<void> => {
    const currentUser: User | null = this.authService.currentUser();
    if (!currentUser) return;

    this.loading.set(true);
    try {
      const post: Post | null = await this.postRepository.savePost({
        title: postFormData.title,
        description: postFormData.description,
        user: {
          userId: currentUser?._id ?? '',
          username: currentUser?.username ?? '',
          profilePictureURL: currentUser?.profilePictureURL ?? '',
        },
        price: typeof postFormData.price === 'number' ? postFormData.price : parseFormattedCurrency(postFormData.price),
        isActive: true,
        finishedAt: null,
        article: {
          category: postFormData.category,
          condition: postFormData.condition,
          characteristics: postFormData.characteristics
        }
      });

      if (!post) return;

      const downloadURLs: string[] | null = await this.#uploadImagesToCloudStorage(post._id);
      await this.postRepository.updatePost({
        _id: post._id,
        mainImageURL: downloadURLs?.[0] ?? '',
        imagesURLs: downloadURLs ?? []
      });

      // Add post to active posts of the user
      const activePostData: ActivePost = {
        _id: post._id,  // Use the post id as the active post id
        title: post?.title ?? '',
        category: post?.article.category ?? ArticleCategory.None,
        price: post?.price ?? 0,
        mainImageURL: downloadURLs?.[0] ?? ''
      };

      await this.userRepository.saveActivePost({
        userId: currentUser._id,
        activePostData: activePostData
      });

      this.latestPublishedPostId.set(post._id);

      this.loading.set(false);
      this.errorMessage.set('');
    } catch (errorMessage: any) {
      console.error(errorMessage);
      this.loading.set(false);
      this.errorMessage.set(errorMessage);
    }
  }

  #convertBlobToDataURL = async (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  #uploadImagesToCloudStorage = async (postId: string, imagesDataURLs: string[] = this.imagesDataURLs()): Promise<string[] | null> => {
    const promises = imagesDataURLs.map(async (imageDataURL, index) => new Promise(async (resolve, reject) => {
      const downloadURL = await this.cloudStorage.upload(`postImages/${postId}/image_${index}`, dataUrlToBlob(imageDataURL));
      if (downloadURL) {
        resolve(downloadURL);
      }
      reject(new Error('Error uploading image to cloud storage'));
    }));

    try {
      const result = await Promise.all(promises);
      return result as string[];
    } catch (cloudStorageError) {
      console.error(cloudStorageError);
      throw cloudStorageError;
    }
  }
}
