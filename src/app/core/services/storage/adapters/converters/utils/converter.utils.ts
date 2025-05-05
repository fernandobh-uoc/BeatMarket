import { FieldValue, Timestamp } from "@angular/fire/firestore";

export function isValidDateInput(val: unknown): val is string | number | Date  {
  return (
    typeof val === 'string' ||
    typeof val === 'number' ||
    val instanceof Date
  );
}

export function isFieldValue(val: unknown): val is FieldValue {
  return typeof val === 'object' && val !== null && '_methodName' in val;
}

export function isFirestoreTimestamp(val: unknown): val is Timestamp {
  return typeof val === 'object' && val !== null && 'toDate' in val && typeof val.toDate === 'function';
}