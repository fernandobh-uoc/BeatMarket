import { ArticleCategory } from "./article.model";

export enum InstrumentType {
  None = '',
  String = 'Cuerda',
  Wind = 'Viento madera',
  Brass = 'Viento metal',
  Percussion = 'Percusión',
  Keyboard = 'Teclados',
  Electronic = 'Electrónica',
  Other = 'Otros'
}

export const InstrumentBrands = {
  // 🎸 String
  String: {
    Fender: 'Fender',
    Gibson: 'Gibson',
    Ibanez: 'Ibanez',
    Taylor: 'Taylor',
    Yamaha: 'Yamaha',
  },

  // 🎹 Keyboard
  Keyboard: {
    Roland: 'Roland',
    Kawai: 'Kawai',
    Korg: 'Korg',
    Steinway: 'Steinway & Sons',
    Casio: 'Casio',
  },

  // 🎷 Wind (woodwinds)
  Wind: {
    BuffetCrampon: 'Buffet Crampon',
    Selmer: 'Selmer',
    YamahaWind: 'Yamaha (viento)',
    Jupiter: 'Jupiter',
  },

  // 🎺 Brass
  Brass: {
    Bach: 'Bach',
    Conn: 'Conn',
    Getzen: 'Getzen',
    Besson: 'Besson',
  },

  // 🥁 Percussion
  Percussion: {
    Pearl: 'Pearl',
    Tama: 'Tama',
    Zildjian: 'Zildjian',
    Ludwig: 'Ludwig',
  },

  // 🎛️ Electronic
  Electronic: {
    Moog: 'Moog',
    Elektron: 'Elektron',
    NativeInstruments: 'Native Instruments',
  },

  // Other (General)
  Other: 'Otra',

  // None or empty
  None: ''
};

type InstrumentBrandForType = {
  [InstrumentType.String]: keyof typeof InstrumentBrands.String;
  [InstrumentType.Keyboard]: keyof typeof InstrumentBrands.Keyboard;
  [InstrumentType.Wind]: keyof typeof InstrumentBrands.Wind;
  [InstrumentType.Brass]: keyof typeof InstrumentBrands.Brass;
  [InstrumentType.Percussion]: keyof typeof InstrumentBrands.Percussion;
  [InstrumentType.Electronic]: keyof typeof InstrumentBrands.Electronic;
  [InstrumentType.Other]: keyof typeof InstrumentBrands.Other;
  [InstrumentType.None]: keyof typeof InstrumentBrands.None;
};

export enum AccesoryType {
  None = '',
  Pedal = 'Pedal',
  Tuner = 'Afinador',
  Stand = 'Atril',
  Metronome = 'Metrónomo',
  Cable = 'Cable',
  Case = 'Estuche',
  Straps = 'Correas',
  Picks = 'Púas',
  Cleaning_kits = 'Kit de limpieza',
  Other = 'Otros'
}

export enum RecordingFormat {
  None = '',
  CD = 'CD',
  Vinyl = 'Vinilo',
  Cassette = 'Cassette',
  Digital = 'Digital',
  Other = 'Otros'
}

export enum BookTheme {
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

export enum InstrumentLevel {
  None = '',
  Basic = 'Básico',
  Intermediate = 'Intermedio',
  Advanced = 'Avanzado'
}

export interface InstrumentCharacteristics {
  category: ArticleCategory.Instruments;
  type: InstrumentType;
  brand: InstrumentBrandForType[InstrumentType];
  model?: string;
  color?: string;
  fabricationYear?: string;
  serialNumber?: string;
  instrumentLevel?: InstrumentLevel;
}

interface RecordingCharacteristics {
  category: ArticleCategory.Recordings;
  format: RecordingFormat;
  recordingTitle: string;
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
  type: AccesoryType;
  name: string;
  brand?: string;
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

interface OtherCharacteristics {
  category: ArticleCategory.Other;
  description: string;
}

export type ArticleCharacteristics = 
  InstrumentCharacteristics | 
  BookCharacteristics | 
  RecordingCharacteristics |
  ProfessionalCharacteristics |
  AccessoryCharacteristics |
  OtherCharacteristics |
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
