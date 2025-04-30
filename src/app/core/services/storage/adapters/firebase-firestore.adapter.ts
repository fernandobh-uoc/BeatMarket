import { EnvironmentInjector, Inject, inject, Injectable, InjectionToken, Injector, runInInjectionContext, Signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { Storage } from '../storage.interface';
import { Firestore, doc, setDoc, getDoc, deleteDoc, collection, query, where, orderBy, getDocs, CollectionReference, Query, QuerySnapshot, addDoc, docData, QueryDocumentSnapshot, DocumentData, onSnapshot, collectionData, FirestoreError, FirestoreDataConverter, DocumentReference, DocumentSnapshot, updateDoc } from '@angular/fire/firestore';
import { AppModel } from "src/app/core/domain/models/appModel.type";
import { UserModel } from "src/app/core/domain/models/user.model";
import { PostModel } from "src/app/core/domain/models/post.model";
import { CartModel } from "src/app/core/domain/models/cart.model";
import { SaleModel } from "src/app/core/domain/models/sale.model";
import { ConversationModel } from "src/app/core/domain/models/conversation.model";
import { Observable } from "rxjs/internal/Observable";


/**
 * Runs an async function in the injection context. This can be awaited, unlike @see {runInInjectionContext}.
 * For some ungodly reason, only the first awaited call inside the fn callback is actually inside the injection context.
 * After something is awaited, the context is lost.
 *
 * NOTE: Use this sparingly and only when absolutely necessary.
 * This is a band-aid solution for this issue:
 * https://github.com/angular/angularfire/pull/3590
 *
 * @param injector The injector, usually inject(EnvironmentInjector)
 * @param fn The async callback to be awaited
 */
export async function runAsyncInInjectionContext<T>(injector: Injector, fn: () => Promise<T>): Promise<T> {
  return await runInInjectionContext(injector, () => {
    return new Promise((resolve, reject) => {
      fn().then(resolve).catch(reject);
    });
  });
}

const FIREBASE_FIRESTORE_USER_TOKEN = new InjectionToken<Storage<UserModel>>('FirebaseFirestoreUser', {
  providedIn: 'root',
  factory: () => new FirebaseFirestoreAdapter<UserModel>(inject(Firestore))
})

const FIREBASE_FIRESTORE_POST_TOKEN = new InjectionToken<Storage<PostModel>>('FirebaseFirestorePost', {
  providedIn: 'root',
  factory: () => new FirebaseFirestoreAdapter<PostModel>(inject(Firestore))
})

const FIREBASE_FIRESTORE_CART_TOKEN = new InjectionToken<Storage<CartModel>>('FirebaseFirestoreCart', {
  providedIn: 'root',
  factory: () => new FirebaseFirestoreAdapter<CartModel>(inject(Firestore))
})

const FIREBASE_FIRESTORE_SALE_TOKEN = new InjectionToken<Storage<SaleModel>>('FirebaseFirestoreSale', {
  providedIn: 'root',
  factory: () => new FirebaseFirestoreAdapter<SaleModel>(inject(Firestore))
});

const FIREBASE_FIRESTORE_CONVERSATION_TOKEN = new InjectionToken<Storage<ConversationModel>>('FirebaseFirestoreConversation', {
  providedIn: 'root',
  factory: () => new FirebaseFirestoreAdapter<ConversationModel>(inject(Firestore))
})

export const FIREBASE_FIRESTORE_TOKENS = {
  user: FIREBASE_FIRESTORE_USER_TOKEN,
  post: FIREBASE_FIRESTORE_POST_TOKEN,
  cart: FIREBASE_FIRESTORE_CART_TOKEN,
  sale: FIREBASE_FIRESTORE_SALE_TOKEN,
  conversation: FIREBASE_FIRESTORE_CONVERSATION_TOKEN
}

@Injectable({ providedIn: 'root' })
export class FirebaseFirestoreAdapter<T extends AppModel & { _id: string }> implements Storage<T> {
  private injector = inject(EnvironmentInjector);
  constructor(private firestore: Firestore) { }

  /* async getById(id: string, params?: any): Promise<T | null> {
    if (params && !params.collection) throw new Error("You must specify the collection");

    try {
      if (params.converter) {
        return <T>(await getDoc(doc(this.firestore, `${params.collection}/${id}`).withConverter(params.converter))).data();
      } else {
        const objectDoc: DocumentSnapshot = await getDoc(doc(this.firestore, `${params.collection}/${id}`));
        if (objectDoc.exists()) {
          return <T>{ ...objectDoc.data(), _id: objectDoc.id };
        }
      }
      return null;
    } catch (firestoreError) {
      throw firestoreError;
    }
  } */

  async getById(id: string, params?: any): Promise<T | null> {
    if (params && !params.collection) throw new Error("You must specify the collection");

    return await runAsyncInInjectionContext(this.injector, async () => {
      try {
        if (params.converter) {
          return <T>(await getDoc(doc(this.firestore, `${params.collection}/${id}`))).data();
        }
        const objectDoc: DocumentSnapshot = await getDoc(doc(this.firestore, `${params.collection}/${id}`));
        if (objectDoc.exists()) {
          return <T>{ ...objectDoc.data(), _id: objectDoc.id };
        }
        return null;
      } catch (firestoreError) {
        throw firestoreError;
      }
    });
  }

  /* getById$(id: string, params?: any): Observable<T | null> {
    if (params && !params.collection) throw new Error("You must specify the collection");

    try {
      if (params.converter) {
        return docData(
          doc(this.firestore, `${params.collection}/${id}`).withConverter(params.converter)
        ) as Observable<T>;
      }
      return docData(doc(this.firestore, `${params.collection}/${id}`), { idField: '_id' }) as Observable<T>;
    } catch (firestoreError) {
      throw firestoreError;
    }
  } */

  getById$(id: string, params?: any): Observable<T | null> {
    if (params && !params.collection) throw new Error("You must specify the collection");

    return runInInjectionContext(this.injector, () => {
      try {
        if (params.converter) {
          return docData(
            doc(this.firestore, `${params.collection}/${id}`).withConverter(params.converter)
          ) as Observable<T>;
        }
        return docData(doc(this.firestore, `${params.collection}/${id}`), { idField: '_id' }) as Observable<T>;
      } catch (firestoreError) {
        throw firestoreError;
      }
    });
  }

  /* async getByField(field: string, value: string, params?: any): Promise<T[] | null> {
    if (!params?.collection) throw new Error("You must specify the collection");

    try {
      const q = query(
        collection(this.firestore, params.collection),
        where(field, '==', value)
      );

      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        return querySnapshot.docs.map(doc => ({ ...doc.data(), _id: doc.id }) as T);
      }
      return null;
    } catch (firestoreError) {
      throw firestoreError;
    }
  } */

  async getByField(field: string, value: string, params?: any): Promise<T[] | null> {
    if (!params?.collection) throw new Error("You must specify the collection");

    return await runAsyncInInjectionContext(this.injector, async () => {
      try {
        const q = query(
          collection(this.firestore, params.collection),
          where(field, '==', value)
        );

        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          return querySnapshot.docs.map(doc => ({ ...doc.data(), _id: doc.id }) as T);
        }
        return null;
      } catch (firestoreError) {
        throw firestoreError;
      }
    });
  }

  /* getByField$(field: string, value: string, params?: any): Observable<T[]> {
    if (!params?.collection) throw new Error("You must specify the collection");

    try {
      const q: Query = query(
        collection(this.firestore, params.collection),
        where(field, '==', value)
      );

      return collectionData(
        q,
        { idField: '_id' }
      ) as Observable<T[]>;
    } catch (firestoreError) {
      throw firestoreError;
    }
  } */

  getByField$(field: string, value: string, params?: any): Observable<T[]> {
    if (!params?.collection) throw new Error("You must specify the collection");

    return runInInjectionContext(this.injector, () => {
      try {
        const q: Query = query(
          collection(this.firestore, params.collection),
          where(field, '==', value)
        );

        return collectionData(
          q,
          { idField: '_id' }
        ) as Observable<T[]>;
      } catch (firestoreError) {
        throw firestoreError;
      }
    });
  }

  /* async getCollection(params?: any): Promise<any[]> {
    if (!params?.collection) throw new Error("You must provide the collection.");

    try {
      let collectionRef: CollectionReference;
      if (params.converter) {
        collectionRef = collection(this.firestore, params.collection).withConverter(params.converter);
      } else {
        collectionRef = collection(this.firestore, params.collection);
      }
      return (await getDocs(collectionRef)).docs.map(doc => ({ ...doc.data() }));
    } catch (firestoreError) {
      throw firestoreError;
    }
  } */

  async getCollection(params?: any): Promise<any[]> {
    if (!params?.collection) throw new Error("You must provide the collection.");

    return await runAsyncInInjectionContext(this.injector, async () => {
      try {
        let collectionRef: CollectionReference;
        if (params.converter) {
          collectionRef = collection(this.firestore, params.collection).withConverter(params.converter);
        } else {
          collectionRef = collection(this.firestore, params.collection);
        }
        return (await getDocs(collectionRef)).docs.map(doc => ({ ...doc.data() }));
      } catch (firestoreError) {
        throw firestoreError;
      }
    });
  }

  /* getCollection$(params?: any): Observable<any[]> {   // any because we might be querying a subcollection of type other than T
    if (!params?.collection) throw new Error("You must provide the collection.");

    try {
      if (params.converter) {
        const collectionRef: CollectionReference = collection(this.firestore, params.collection).withConverter(params.converter);
        return collectionData(collectionRef);
      } else {
        const collectionRef: CollectionReference = collection(this.firestore, params.collection);
        return collectionData(collectionRef, { idField: '_id' });
      }
    } catch (firestoreError) {
      throw firestoreError;
    }
  } */

  /* getCollection$(params?: any): Observable<any[]> {   // any because we might be querying a subcollection of type other than T
    if (!params?.collection) throw new Error("You must provide the collection.");

    return runInInjectionContext(this.injector, () => {
      try {
        if (params.converter) {
          const collectionRef: CollectionReference = collection(this.firestore, params.collection).withConverter(params.converter);
          return collectionData(collectionRef);
        } else {
          const collectionRef: CollectionReference = collection(this.firestore, params.collection);
          return collectionData(collectionRef, { idField: '_id' });
        }
      } catch (firestoreError) {
        throw firestoreError;
      }
    });
  } */

  getCollection$(params?: any): Observable<any[]> {   // any because we might be querying a subcollection of type other than T
    if (!params?.collection) throw new Error("You must provide the collection.");

    console.log(`getCollection$ params: ${JSON.stringify(params)}`);
    return runInInjectionContext(this.injector, () => {
      try {
        let collectionRef: CollectionReference<DocumentData>;
        if (params.converter) {
          collectionRef = collection(this.firestore, params.collection).withConverter(params.converter);
        } else {
          collectionRef = collection(this.firestore, params.collection);
        }

        let q: Query = collectionRef;

        // Apply filters ([{ field: 'active', operator: '==', value: true }])
        if (params.filters && Array.isArray(params.filters)) {
          params.filters.forEach((filter: { field: string; operator: any; value: any }) => {
            q = query(q, where(filter.field, filter.operator, filter.value));
          });
        }

        // Apply ordering ({ field: 'createdAt', direction: 'desc' })
        if (params.orderBy) {
          q = query(q, orderBy(params.orderBy.field, params.orderBy.direction || 'asc'));
        }

        return collectionData(q, { idField: '_id' }) as Observable<any[]>;
      } catch (firestoreError) {
        throw firestoreError;
      }
    });
  }

  /* getCollection$(params?: any): Observable<T[]> {
    if (!params?.collection) throw new Error("You must provide the collection.");

    try {
      const collectionRef: CollectionReference = collection(this.firestore, params.collection);
      let firestoreQuery: Query = collectionRef;
  
      // Apply filters dynamically
      if (params.filters && Array.isArray(params.filters)) {
        params.filters.forEach((filter: { field: string; operator: any; value: any }) => {
          firestoreQuery = query(firestoreQuery, where(filter.field, filter.operator, filter.value));
        });
      }
  
      // Apply sorting if specified
      if (params.orderBy) {
        firestoreQuery = query(firestoreQuery, orderBy(params.orderBy.field, params.orderBy.direction || 'asc'));
      }
  
      const querySnapshot = await getDocs(firestoreQuery);
      return querySnapshot.docs.map(doc => ({...doc.data(), _id: doc.id }) as T);
    } catch (firestoreError) {
      throw firestoreError;
    }
  } */

  async create(obj: T, params?: any): Promise<T | null> {
    if (!params?.collection) throw new Error("You must provide the collection.");
    try {
      const docRef = await addDoc(
        params.converter ?
          collection(this.firestore, params.collection).withConverter(params.converter) :
          collection(this.firestore, params.collection),
        obj
      );
      return { ...obj, _id: docRef.id };
    } catch (firestoreError) {
      throw firestoreError;
    }
  };

  async update(obj: T, params?: any): Promise<T | null> {
    if (!params?.collection) throw new Error("You must provide the collection.");
    if (!obj._id) throw new Error("You must provide the id of the object to update.");

    try {
      await setDoc(
        params.converter ?
          doc(this.firestore, params.collection, obj._id).withConverter(params.converter) :
          doc(this.firestore, params.collection, obj._id),
        obj
      );
      return obj;
    } catch (firestoreError) {
      throw firestoreError;
    }
  };

  async remove(id: string, params?: any): Promise<T | null> {
    if (params && !params.collection) throw new Error("You must provide the collection.");
    try {
      const objectDoc = doc(this.firestore, `${params.collection}/${id}`);
      const docSnapshot = await getDoc(objectDoc);

      if (!docSnapshot.exists()) {
        throw new Error(`Document with uid ${id} does not exist.`);
      }

      await deleteDoc(objectDoc);
      return null;  // Return null after successful deletion
    } catch (firestoreError) {
      throw firestoreError;
    }
  };

  async exists(id: string, params: any): Promise<boolean> {
    if (params && !params.collection) throw new Error("You must provide the collection.");
    try {
      const objectDoc = doc(this.firestore, `${params.collection}/${id}`);
      const docSnapshot = await getDoc(objectDoc);
      return docSnapshot.exists();  // Returns true if the document exists, false otherwise
    } catch (firestoreError) {
      throw firestoreError;
    }
  };

  async query(params?: any): Promise<T[]> {
    if (!params || !params.collection) {
      throw new Error("You must provide the collection.");
    }

    try {
      const collectionRef: CollectionReference = collection(this.firestore, params.collection);
      let firestoreQuery: Query = collectionRef;

      // Apply filters dynamically
      if (params.filters && Array.isArray(params.filters)) {
        params.filters.forEach((filter: { field: string; operator: any; value: any }) => {
          firestoreQuery = query(firestoreQuery, where(filter.field, filter.operator, filter.value));
        });
      }

      // Apply sorting if specified
      if (params.orderBy) {
        firestoreQuery = query(firestoreQuery, orderBy(params.orderBy.field, params.orderBy.direction || 'asc'));
      }

      const querySnapshot = await getDocs(firestoreQuery);
      return querySnapshot.docs.map(doc => ({ ...doc.data(), _id: doc.id }) as T);
    } catch (firestoreError) {
      throw firestoreError;
    }
  }
}