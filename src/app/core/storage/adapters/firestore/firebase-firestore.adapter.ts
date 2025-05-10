import { EnvironmentInjector, Injectable, inject, InjectionToken, Injector, runInInjectionContext } from "@angular/core";
import { Observable } from "rxjs/internal/Observable";
import { 
  Firestore, 
  doc, docData, getDoc, addDoc, setDoc, updateDoc, deleteDoc, getDocs, 
  DocumentReference, DocumentSnapshot, 
  collection, collectionData,  
  CollectionReference, FieldPath,
  FirestoreDataConverter,
  query, Query, QuerySnapshot, 
  or, and, where, orderBy, 
  limit as queryLimit, 
  startAt as queryStartAt, 
  startAfter as queryStartAfter, 
  endAt as queryEndAt, 
  endBefore as queryEndBefore,
  QueryConstraint, QueryFilterConstraint,
  WhereFilterOp, OrderByDirection,
  serverTimestamp, 

  FirestoreErrorCode,
} from '@angular/fire/firestore';

import { Storage } from '../../storage.interface';
import { AppModel } from "src/app/core/domain/models/appModel.type";


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

type FirestoreFilter =
  | { field: string | FieldPath; operator: WhereFilterOp; value: unknown }
  | { and: FirestoreFilter[] }
  | { or: FirestoreFilter[] };


export interface FirestoreParams {
  collection?: string | undefined;
  converter?: FirestoreDataConverter<any>;
  queryConstraints?: {
    filters?: FirestoreFilter[];
    orderBy?: { field: string | FieldPath; direction?: OrderByDirection };
    limit?: number;
    startAt?: unknown;
    startAfter?: unknown;
    endAt?: unknown;
    endBefore?: unknown;
  };
}

function isFilterConstraint(c: any): c is QueryFilterConstraint {
  return ['where', 'or', 'and'].includes(c.type);
}

function buildQueryConstraints(filters: FirestoreFilter[]): QueryConstraint[] {
  const constraints: QueryConstraint[] = [];

  Array.from(filters).forEach(f => {
    if ('or' in f) {
      const sub = buildQueryConstraints(f.or);
      const filterConstraints = sub.filter(isFilterConstraint) as QueryFilterConstraint[];
      constraints.push(or(...filterConstraints) as unknown as QueryConstraint); // <- key fix
    } else if ('and' in f) {
      const sub = buildQueryConstraints(f.and);
      const filterConstraints = sub.filter(isFilterConstraint) as QueryFilterConstraint[];
      constraints.push(and(...filterConstraints) as unknown as QueryConstraint);
    } else {
      constraints.push(where(f.field, f.operator, f.value));
    }
  });

  return constraints;
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

  async remove(id: string, params?: FirestoreParams): Promise<boolean> {
    if (params && !params.collection) throw new Error("You must provide the collection.");
    try {
      const docRef: DocumentReference = doc(this.firestore, `${params?.collection}/${id}`);
      const docSnapshot = await getDoc(docRef);

      if (!docSnapshot.exists()) {
        console.error(`Document with uid ${id} does not exist.`);
        return false;
      }

      await deleteDoc(docRef);
      return true;  // Return null after successful deletion
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

  async query(params: FirestoreParams): Promise<T[] | null> {
    if (!params.collection) {
      throw new Error("You must provide the collection.");
    }

    if (!params.queryConstraints) {
      throw new Error("You must provide the query constraints.");
    }

    try {
      let collectionRef: CollectionReference = collection(this.firestore, params.collection);
      collectionRef = params?.converter ? collectionRef.withConverter(params.converter) : collectionRef;

      const constraints: QueryConstraint[] = [];
      const { filters, orderBy: order, limit, startAt, startAfter, endAt, endBefore } = params.queryConstraints;

      if (filters?.length) {
        constraints.push(...buildQueryConstraints(filters));
      }
      if (order) {
        constraints.push(orderBy(order.field, order.direction || 'asc'));
      }
      if (limit !== undefined) {
        constraints.push(queryLimit(limit));
      }
      if (startAt !== undefined) {
        constraints.push(queryStartAt(startAt));
      }
      if (startAfter !== undefined) {
        constraints.push(queryStartAfter(startAfter));
      }
      if (endAt !== undefined) {
        constraints.push(queryEndAt(endAt));
      }
      if (endBefore !== undefined) {
        constraints.push(queryEndBefore(endBefore));
      }

      const firestoreQuery: Query = query(collectionRef, ...constraints);
      const snapshot = await getDocs(firestoreQuery);

      return snapshot.docs.map(doc => ({ ...doc.data(), _id: doc.id }) as T);
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