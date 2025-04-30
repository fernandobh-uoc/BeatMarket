export interface JSONSerializable<T> {
  fromJSON(json: string): T | null,
  toJSON(): string;
}