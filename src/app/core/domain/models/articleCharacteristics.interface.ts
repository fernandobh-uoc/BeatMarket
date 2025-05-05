import { ArticleCategory } from "./article.model";

enum InstrumentType {
  None = '',
  String = 'Cuerda',
  Wind = 'Viento madera',
  Brass = 'Viento metal',
  Percussion = 'Percusión',
  Keyboard = 'Teclados',
  Electronic = 'Electrónica',
  Other = 'Otros'
}

enum RecordingFormat {
  CD = 'CD',
  Vinyl = 'Vinilo',
  Cassette = 'Cassette',
  Digital = 'Digital',
  Other = 'Otros'
}

enum BookTheme {
  None = 'none',
  Music_sheets = 'Partituras',
  Music_theory = 'Teoría musical',
  Study_method = 'Métodos de estudio',
  Composition = 'Composición',
  Analysis = 'Análisis',
  Music_history = 'Historia de la música',
  Other = 'Otros'
}

interface NoneCharacteristics {
  category: ArticleCategory.None;
}

type InstrumentLevel = 'Básico' | 'Intermedio' | 'Avanzado';

export interface InstrumentCharacteristics {
  category: ArticleCategory.Instruments;
  type: InstrumentType;
  brand: string;
  model?: string;
  color?: string;
  fabricationYear?: string;
  serialNumber?: string;
  accessories?: string[];
  instrumentLevel?: InstrumentLevel;
}

interface RecordingCharacteristics {
  category: ArticleCategory.Recordings;
  format: RecordingFormat;
  title: string;
  artist: string;
  genre: string;
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
}

interface AccessoryCharacteristics {
  category: ArticleCategory.Accessories;
  name: string;
  brand: string;
  associatedInstrument?: string;
}

interface ProfessionalCharacteristics {
  category: ArticleCategory.Professional;
  name: string;
  brand: string;
  model?: string;
  color?: string;
  fabricationYear?: string;
  serialNumber?: string;
  accessories?: string[];
  warranty?: string;
  warrantyDuration?: string;
  warrantyType?: string;
  warrantyDate?: string;
  warrantyCountry?: string;
}

interface BookCharacteristics {
  category: ArticleCategory.Books;
  title: string;
  author: string;
  theme: BookTheme;
  edition?: string;
  publisher?: string;
  year?: string;
  pages?: number;
  language?: string;
  isbn?: string;
  series?: string;
  volume?: string;
}

export type ArticleCharacteristics = 
  InstrumentCharacteristics | 
  BookCharacteristics | 
  RecordingCharacteristics |
  ProfessionalCharacteristics |
  AccessoryCharacteristics |
  NoneCharacteristics;

export function isInstrumentCharacteristics(c: ArticleCharacteristics): c is InstrumentCharacteristics {
  return c.category === ArticleCategory.Instruments;
}

export function isBookCharacteristics(c: ArticleCharacteristics): c is BookCharacteristics {
  return c.category === ArticleCategory.Books;
}

export function isRecordingCharacteristics(c: ArticleCharacteristics): c is RecordingCharacteristics {
  return c.category === ArticleCategory.Recordings;
}

export function isAccessoryCharacteristics(c: ArticleCharacteristics): c is AccessoryCharacteristics {
  return c.category === ArticleCategory.Accessories;
}

export function isProfessionalCharacteristics(c: ArticleCharacteristics): c is ProfessionalCharacteristics {
  return c.category === ArticleCategory.Professional;
}

export function isNoneCharacteristics(c: ArticleCharacteristics): c is NoneCharacteristics {
  return c.category === ArticleCategory.None;
}
