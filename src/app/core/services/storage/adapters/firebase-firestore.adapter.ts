import { EnvironmentInjector, Inject, inject, Injectable, InjectionToken, Injector, runInInjectionContext, Signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { Storage } from '../storage.interface';
import { FirestoreErrorCode, Firestore, doc, setDoc, getDoc, deleteDoc, collection, query, where, orderBy, getDocs, CollectionReference, Query, QuerySnapshot, addDoc, docData, QueryDocumentSnapshot, DocumentData, onSnapshot, collectionData, FirestoreError, FirestoreDataConverter, DocumentReference, DocumentSnapshot, updateDoc, WhereFilterOp, FieldPath, OrderByDirection, limit, limitToLast, startAt, startAfter, endAt, serverTimestamp, QueryConstraint } from '@angular/fire/firestore';
import { AppModel } from "src/app/core/domain/models/appModel.type";
import { ActivePost, UserModel } from "src/app/core/domain/models/user.model";
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

export interface FirestoreParams {
  collection?: string | undefined;
  converter?: FirestoreDataConverter<any>;
  queryConstraints?: QueryConstraint[];
  /* filters?: { field: string | FieldPath; operator: WhereFilterOp; value: unknown }[];
  orderBy?: { field: string | FieldPath; direction?: OrderByDirection };
  limit?: number;
  startAt?: unknown;
  startAfter?: unknown;
  endAt?: unknown;
  endBefore?: unknown; */
}

@Injectable({ providedIn: 'root' })
export class FirebaseFirestoreAdapter<T extends AppModel & { _id: string }> implements Storage<T> {
  private injector = inject(EnvironmentInjector);
  constructor(private firestore: Firestore) { }

  async getById(id: string, params?: FirestoreParams): Promise<T | null> {
    
    return await runAsyncInInjectionContext(this.injector, async () => {
      if (params && !(params.collection)) throw new Error("You must specify the collection");
      try {
        let docRef: DocumentReference = doc(this.firestore, `${params?.collection}/${id}`);

        docRef = params?.converter ? docRef.withConverter(params.converter) : docRef;
        const objectDoc: DocumentSnapshot = await getDoc(docRef);

        if (objectDoc.exists()) {
          return <T>{ ...objectDoc.data(), _id: objectDoc.id };
        }
        return null;
      } catch (firestoreError: any) {
        throw this.getErrorMessage(firestoreError);
      }
    });
  }

  getById$(id: string, params?: FirestoreParams): Observable<T | null> {
    return runInInjectionContext(this.injector, () => {
      if (!params?.collection) throw new Error("You must specify the collection");

      try {
        let docRef: DocumentReference = doc(this.firestore, `${params?.collection}/${id}`);
        docRef = params?.converter ? docRef.withConverter(params.converter) : docRef;
        return docData(docRef) as Observable<T>;
      } catch (firestoreError: any) {
        throw this.getErrorMessage(firestoreError);
      }
    });
  }

  async getByField(field: string, value: string, params?: FirestoreParams): Promise<T[] | null> {
    return await runAsyncInInjectionContext(this.injector, async () => {
      if (!params?.collection) throw new Error("You must specify the collection");

      try {
        let collectionRef: CollectionReference = collection(this.firestore, params?.collection);
        collectionRef = params?.converter ? collectionRef.withConverter(params.converter) : collectionRef;

        const q: Query = query(
          collectionRef,
          where(field, '==', value)
        );

        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          return querySnapshot.docs.map(doc => ({ ...doc.data(), _id: doc.id }) as T);
        }
        return null;
      } catch (firestoreError: any) {
        throw this.getErrorMessage(firestoreError);
      }
    });
  }

  getByField$(field: string, value: string, params?: FirestoreParams): Observable<T[]> {
    return runInInjectionContext(this.injector, () => {
      if (!params?.collection) throw new Error("You must specify the collection");

      try {
        let collectionRef: CollectionReference = collection(this.firestore, params?.collection);
        collectionRef = params?.converter ? collectionRef.withConverter(params.converter) : collectionRef;
        const q: Query = query(
          collectionRef,
          where(field, '==', value)
        );

        return collectionData(
          q,
          { idField: '_id' }
        ) as Observable<T[]>;
      } catch (firestoreError: any) {
        throw this.getErrorMessage(firestoreError);
      }
    });
  }

  async getCollection(params?: FirestoreParams): Promise<any[]> {
    return await runAsyncInInjectionContext(this.injector, async () => {
      if (!params?.collection) throw new Error("You must provide the collection.");

      try {
        let collectionRef: CollectionReference = collection(this.firestore, params.collection);
        collectionRef = params?.converter ? collectionRef.withConverter(params.converter) : collectionRef;
        return (await getDocs(collectionRef)).docs.map(doc => ({ ...doc.data(), _id: doc.id }));
      } catch (firestoreError: any) {
        throw this.getErrorMessage(firestoreError);
      }
    });
  }

  getCollection$(params?: FirestoreParams): Observable<any[]> {   // any because we might be querying a subcollection of type other than T    
    return runInInjectionContext(this.injector, () => {
      if (!params?.collection) throw new Error("You must provide the collection.");

      try {
        let collectionRef: CollectionReference = collection(this.firestore, params.collection);
        collectionRef = params?.converter ? collectionRef.withConverter(params.converter) : collectionRef;

        return collectionData(collectionRef, { idField: '_id' }) as Observable<any[]>;
        /* let q: Query = collectionRef;

        // Apply filters ([{ field: 'active', operator: '==', value: true }])
        if (params.filters && Array.isArray(params.filters)) {
          params.filters.forEach((filter: { field: string | FieldPath; operator: any; value: any }) => {
            q = query(q, where(filter.field, filter.operator, filter.value));
          });
        }

        // Apply ordering ({ field: 'createdAt', direction: 'desc' })
        if (params.orderBy) {
          q = query(q, orderBy(params.orderBy.field, params.orderBy.direction || 'asc'));
        }

        return collectionData(q, { idField: '_id' }) as Observable<any[]>; */
      } catch (firestoreError: any) {
        throw this.getErrorMessage(firestoreError);
      }
    });
  }

  async create(obj: T, params?: FirestoreParams): Promise<T | null> {
    if (!params?.collection) throw new Error("You must provide the collection.");

    try {
      const now = serverTimestamp();

      const objWithTimestamps = { 
        ...obj, 
        createdAt: now, 
        updatedAt: now, 
      };

      let docRef: DocumentReference;
      if (obj._id) {
        docRef = doc(this.firestore, `${params.collection}/${obj._id}`);
        docRef = params?.converter ? docRef.withConverter(params.converter) : docRef;

        await setDoc(docRef, objWithTimestamps);
      } else {
        let collectionRef: CollectionReference = collection(this.firestore, params.collection);
        collectionRef = params?.converter ? collectionRef.withConverter(params.converter) : collectionRef;

        docRef = await addDoc(collectionRef, obj);
      }
      const retObj: T = (await getDoc(docRef)).data() as T;
      return <T>({ ...retObj, _id: docRef.id });
    } catch (firestoreError: any) {
      throw this.getErrorMessage(firestoreError);
    }
  };

  async createInSubcollection(obj: any, params?: FirestoreParams): Promise<any | null> {
    if (!params?.collection) throw new Error("You must provide the collection.");

    try {
      let docRef: DocumentReference = doc(this.firestore, `${params.collection}`);
      docRef = params?.converter ? docRef.withConverter(params.converter) : docRef;

      await setDoc(docRef, obj);
      const retObj: any = (await getDoc(docRef)).data();
      return ({ ...retObj, _id: docRef.id });
    } catch (firestoreError: any) {
      throw this.getErrorMessage(firestoreError);
    }
  };

  async updateInSubcollection(obj: any & { _id: string; }, params?: any): Promise<any | null> {
    if (!params?.collection) throw new Error("You must provide the collection.");

    try {
      let docRef: DocumentReference = doc(this.firestore, `${params.collection}`);
      docRef = params?.converter ? docRef.withConverter(params.converter) : docRef;

      await updateDoc(docRef, obj);
      const retObj: any = (await getDoc(docRef)).data();
      return ({ ...retObj, _id: docRef.id });
    } catch (firestoreError: any) {
      throw this.getErrorMessage(firestoreError);
    }
  }

  async update(obj: Partial<T> & { _id: string }, params?: FirestoreParams): Promise<T | null> {
    if (!params?.collection) {
      throw new Error("You must provide the collection.");
    }
  
    try {
      let docRef: DocumentReference = doc(this.firestore, params.collection, obj._id);
      docRef = params?.converter ? docRef.withConverter(params.converter) : docRef;
  
      const { _id, ...fieldsToUpdate } = obj;
  
      await updateDoc(docRef, {
        ...fieldsToUpdate,
        updatedAt: serverTimestamp()
      });
  
      return this.getById(obj._id, params); // Return the updated object
    } catch (firestoreError: any) {
      throw this.getErrorMessage(firestoreError);
    }
  }

  async remove(id: string, params?: FirestoreParams): Promise<T | null> {
    if (params && !params.collection) throw new Error("You must provide the collection.");
    try {
      const docRef: DocumentReference = doc(this.firestore, `${params?.collection}/${id}`);
      const docSnapshot = await getDoc(docRef);

      if (!docSnapshot.exists()) {
        throw new Error(`Document with uid ${id} does not exist.`);
      }

      await deleteDoc(docRef);
      return null;  // Return null after successful deletion
    } catch (firestoreError: any) {
      throw this.getErrorMessage(firestoreError);
    }
  };

  async exists(id: string, params: FirestoreParams): Promise<boolean> {
    if (params && !params.collection) throw new Error("You must provide the collection.");
    try {
      const docRef: DocumentReference = doc(this.firestore, `${params.collection}/${id}`);
      const docSnapshot = await getDoc(docRef);
      return docSnapshot.exists();  // Returns true if the document exists, false otherwise
    } catch (firestoreError: any) {
      throw this.getErrorMessage(firestoreError);
    }
  };

  async query(params?: FirestoreParams): Promise<T[]> {
    if (!params || !params.collection) {
      throw new Error("You must provide the collection.");
    }

    try {
      const collectionRef: CollectionReference = collection(this.firestore, params.collection);
      let firestoreQuery: Query = collectionRef;

      // Apply constraints
      if (params.queryConstraints && Array.isArray(params.queryConstraints)) {
        params.queryConstraints.forEach((queryConstraint: QueryConstraint) => {
          firestoreQuery = query(firestoreQuery, queryConstraint);
        });

        /* params.filters.forEach((filter: { field: string | FieldPath; operator: WhereFilterOp; value: unknown }) => {
          firestoreQuery = query(firestoreQuery, where(filter.field, filter.operator, filter.value));
        }); */
      }

      // Apply sorting if specified
      /* if (params.orderBy) {
        firestoreQuery = query(firestoreQuery, orderBy(params.orderBy.field, params.orderBy.direction || 'asc'));
      }

      if (params.limit) {
        firestoreQuery = query(firestoreQuery, limit(params.limit));
      } */

      const querySnapshot = await getDocs(firestoreQuery);
      return querySnapshot.docs.map(doc => ({ ...doc.data(), _id: doc.id }) as T);
    } catch (firestoreError: any) {
      throw this.getErrorMessage(firestoreError);
    }
  }

  query$(params?: FirestoreParams): Observable<T[]> {
    if (!params || !params.collection) {
      throw new Error("You must provide the collection.");
    }

    try {
      let collectionRef: CollectionReference = collection(this.firestore, params.collection);
      collectionRef = params?.converter ? collectionRef.withConverter(params.converter) : collectionRef;
      let q: Query = collectionRef;

      // Apply constraints
      if (params.queryConstraints && Array.isArray(params.queryConstraints)) {
        params.queryConstraints.forEach((queryConstraint: QueryConstraint) => {
          q = query(q, queryConstraint);
        });
      }

      return collectionData(q, { idField: '_id' }) as Observable<any[]>;
    } catch (firestoreError: any) {
      throw this.getErrorMessage(firestoreError);
    }
  }

  private getErrorMessage(errorCode: string): string {
    console.error(errorCode);
    /* const errorMessages: Record<string, string> = {
      'cancelled': 'La operación fue cancelada.',
      'unknown': 'Ocurrió un error desconocido.',
      'invalid-argument': 'Se proporcionó un argumento no válido.',
      'deadline-exceeded': 'El tiempo de espera de la operación expiró.',
      'not-found': 'Documento no encontrado.',
      'already-exists': 'El documento ya existe.',
      'permission-denied': 'No tienes permiso para realizar esta operación.',
      'resource-exhausted': 'Se han excedido los recursos disponibles.',
      'failed-precondition': 'La operación no puede realizarse en el estado actual.',
      'aborted': 'La operación fue abortada.',
      'out-of-range': 'El valor está fuera del rango permitido.',
      'unimplemented': 'Esta operación no está implementada.',
      'internal': 'Error interno del servidor.',
      'unavailable': 'El servicio no está disponible actualmente.',
      'data-loss': 'Pérdida de datos no recuperable.',
      'unauthenticated': 'No estás autenticado para realizar esta operación.'
    };
  
    return errorMessages[errorCode] || 'Error en la base de datos. Por favor, inténtalo de nuevo.'; */
    return 'Database error';	
  }
}