import { ArticleCategory, ArticleCondition } from "src/app/core/domain/models/article.model";
import { AccesoryType, BookTheme, InstrumentLevel, InstrumentType, RecordingFormat } from "src/app/core/domain/models/articleCharacteristics.interface";

export const posts = [
  {
    // Instrumentos
    /////////////////////
    title: 'Guitarra eléctrica Fender Stratocaster',
    description: 'Clásica guitarra Fender, ideal para principiantes y avanzados.',
    price: 850,
    status: 'active',
    finishedAt: null,
    article: {
      category: 'Instrumentos',
      condition: 'Bueno',
      characteristics: {
        category: 'Instrumentos',
        type: 'Cuerda',
        brand: 'Fender',
        model: 'Stratocaster',
        color: 'Sunburst',
        fabricationYear: '2015',
        serialNumber: 'STR12345',
        instrumentLevel: 'Intermedio'
      }
    }
  },
  {
    /////////////////////
    title: 'Batería Pearl Export Series',
    description: 'Set completo de batería en muy buen estado.',
    price: 1100,
    status: 'active',
    finishedAt: null,
    article: {
      category: 'Instrumentos',
      condition: 'Usado',
      characteristics: {
        category: 'Instrumentos',
        type: 'Percusión',
        brand: 'Pearl',
        model: 'Export Series',
        color: 'Negro',
        fabricationYear: '2012',
        serialNumber: 'PEARL789',
        instrumentLevel: 'Avanzado'
      }
    }
  },
  {

    title: 'Sintetizador Moog Subsequent 37',
    description: 'Síntesis analógica de alta calidad.',
    price: 1600,
    status: 'active',
    finishedAt: null,
    article: {
      category: 'Instrumentos',
      condition: 'Nuevo',
      characteristics: {
        category: 'Instrumentos',
        type: 'Electrónica',
        brand: 'Moog',
        model: 'Subsequent 37',
        color: 'Negro',
        fabricationYear: '2021',
        serialNumber: 'MOOG2021',
        instrumentLevel: 'Avanzado'
      }
    }
  },

  // Grabaciones
  {
    /////////////////////
    title: 'The Dark Side of the Moon - Pink Floyd (Vinilo)',
    description: 'Edición original, en excelente estado.',
    price: 45,
    status: 'active',
    finishedAt: null,
    article: {
      category: 'Grabaciones',
      condition: 'Bueno',
      characteristics: {
        category: 'Grabaciones',
        format: 'Vinilo',
        recordingTitle: 'The Dark Side of the Moon',
        artist: 'Pink Floyd',
        genre: 'Rock',
        year: '1973',
        label: 'Harvest',
        catalogNumber: 'SHVL 804'
      }
    }
  },
  {

    title: 'Kind of Blue - Miles Davis (CD)',
    description: 'Uno de los álbumes de jazz más influyentes.',
    price: 12,
    status: 'active',
    finishedAt: null,
    article: {
      category: 'Grabaciones',
      condition: 'Bueno',
      characteristics: {
        category: 'Grabaciones',
        format: 'CD',
        recordingTitle: 'Kind of Blue',
        artist: 'Miles Davis',
        genre: 'Jazz',
        year: '1959',
        label: 'Columbia',
        catalogNumber: 'CK 64935'
      }
    }
  },
  {
    /////////////////////
    title: 'Abbey Road - The Beatles (Digital)',
    description: 'Versión remasterizada digital.',
    price: 9,
    status: 'active',
    finishedAt: null,
    article: {
      category: 'Grabaciones',
      condition: 'Nuevo',
      characteristics: {
        category: 'Grabaciones',
        format: 'Digital',
        recordingTitle: 'Abbey Road',
        artist: 'The Beatles',
        genre: 'Rock',
        year: '1969',
        label: 'Apple Records'
      }
    }
  },

  // Accesorios
  {
    /////////////////////////////////
    title: 'Pedal de distorsión Ibanez TS9',
    description: 'Pedal clásico de distorsión para guitarra.',
    price: 70,
    status: 'active',
    finishedAt: null,
    article: {
      category: 'Accesorios',
      condition: 'Bueno',
      characteristics: {
        category: 'Accesorios',
        type: 'Pedal',
        name: 'TS9 Tube Screamer',
        brand: 'Ibanez',
        associatedInstrument: 'Guitarra'
      }
    }
  },
  {

    title: 'Afinador cromático Korg',
    description: 'Afinador compacto y preciso para todos los instrumentos.',
    price: 25,
    status: 'active',
    finishedAt: null,
    article: {
      category: 'Accesorios',
      condition: 'Nuevo',
      characteristics: {
        category: 'Accesorios',
        type: 'Afinador',
        name: 'Korg TM-60',
        brand: 'Korg'
      }
    }
  },
  {
    /////////////////////
    title: 'Metrónomo digital Korg MA-2',
    description: 'Metrónomo compacto y preciso, ideal para práctica diaria.',
    price: 25,
    status: 'active',
    finishedAt: null,
    mainImageURL: '',
    imagesURLs: [],
    user: {
      id: 'user123',
      name: 'John Doe'
    },
    article: {
      category: ArticleCategory.Accessories,
      condition: ArticleCondition.New,
      characteristics: {
        category: ArticleCategory.Accessories,
        type: AccesoryType.Metronome,
        name: 'Korg MA-2',
        brand: 'Korg',
        associatedInstrument: 'General'
      }
    }
  },

  {
    /////////////////////
    _id: '27',
    title: 'Baquetas Vic Firth 5A American Classic',
    description: 'Baquetas equilibradas para todo tipo de estilos, ideal para práctica y presentaciones.',
    price: 12,
    status: 'active',
    finishedAt: null,
    mainImageURL: '',
    imagesURLs: [],
    user: {
      id: 'user456',
      name: 'Jane Smith'
    },
    article: {
      category: ArticleCategory.Accessories,
      condition: ArticleCondition.New,
      characteristics: {
        category: ArticleCategory.Accessories,
        type: AccesoryType.Other,
        name: 'Vic Firth 5A American Classic',
        brand: 'Vic Firth',
        associatedInstrument: 'Batería'
      }
    }
  },
  {

    title: 'Correa de cuero para bajo',
    description: 'Correa ajustable de alta calidad.',
    price: 35,
    status: 'active',
    finishedAt: null,
    article: {
      category: 'Accesorios',
      condition: 'Nuevo',
      characteristics: {
        category: 'Accesorios',
        type: 'Correas',
        name: 'Correa de cuero',
        brand: 'Ernie Ball'
      }
    }
  },

  // Profesional
  {
    /////////////////////
    title: 'Micrófono Shure SM7B con estuche y soporte',
    description: 'Ideal para grabaciones profesionales.',
    price: 420,
    status: 'active',
    finishedAt: null,
    article: {
      category: 'Profesional',
      condition: 'Nuevo',
      characteristics: {
        category: 'Profesional',
        name: 'SM7B',
        brand: 'Shure',
        model: 'SM7B',
        color: 'Negro',
        fabricationYear: '2023',
        accessories: ['Estuche', 'Soporte'],
        warranty: 'Incluida',
        warrantyDuration: '2 años',
        warrantyType: 'Fabricante',
        warrantyDate: '2023-06-01',
        warrantyCountry: 'USA'
      }
    }
  },
  {

    title: 'Interfaz de audio Focusrite Scarlett 2i2',
    description: '2 entradas / 2 salidas USB, perfecta para home studios.',
    price: 160,
    status: 'active',
    finishedAt: null,
    article: {
      category: 'Profesional',
      condition: 'Bueno',
      characteristics: {
        category: 'Profesional',
        name: 'Scarlett 2i2',
        brand: 'Focusrite',
        model: '3rd Gen',
        color: 'Rojo',
        fabricationYear: '2020',
        serialNumber: 'SC2020FR',
        warranty: 'No'
      }
    }
  },

  {
    _id: '28',
    title: 'Tocadiscos Technics SL-1200 MK7',
    description: 'Tocadiscos profesional de alta calidad, ideal para DJs y audiófilos.',
    price: 1300,
    status: 'active',
    finishedAt: null,
    mainImageURL: '',
    imagesURLs: [],
    user: {
      id: 'user789',
      name: 'Carlos García'
    },
    article: {
      category: ArticleCategory.Recordings,
      condition: ArticleCondition.Good,
      characteristics: {
        category: ArticleCategory.Professional,
        name: 'SL-1200 MK7',
        brand: 'Technics',
        model: 'SL-1200 MK7',
        fabricationYear: '2020',
        color: 'Negro',
        serialNumber: 'TECH1200MK7',
        warranty: 'Sí',
        warrantyDuration: '2 años',
        warrantyType: 'Garantía limitada',
        warrantyDate: '2023-05-01',
        warrantyCountry: 'España'
      }
    }
  },

  {
    _id: '29',
    title: 'Cejilla de guitarra Kyser Quick-Change',
    description: 'Cejilla de fácil uso para guitarras acústicas y eléctricas, ideal para cambiar de tono rápidamente.',
    price: 15,
    status: 'active',
    finishedAt: null,
    mainImageURL: '',
    imagesURLs: [],
    user: {
      id: 'user321',
      name: 'Luis Rodríguez'
    },
    article: {
      category: ArticleCategory.Accessories,
      condition: ArticleCondition.New,
      characteristics: {
        category: ArticleCategory.Accessories,
        type: AccesoryType.Other,
        name: 'Kyser Quick-Change',
        brand: 'Kyser',
        associatedInstrument: 'Guitarra'
      }
    }
  },

  // Libros
  {
    /////////////////////
    title: 'Teoría Musical Moderna - Enric Herrera',
    description: 'Libro fundamental para el aprendizaje musical.',
    price: 30,
    status: 'active',
    finishedAt: null,
    article: {
      category: 'Libros',
      condition: 'Bueno',
      characteristics: {
        category: 'Libros',
        title: 'Teoría Musical Moderna',
        author: 'Enric Herrera',
        theme: 'Teoría musical',
        edition: '2ª',
        publisher: 'Musicalis',
        year: '1998',
        pages: 320,
        language: 'Español',
        isbn: '9788479180449'
      }
    }
  },
  {

    title: 'Historia de la Música Occidental',
    description: 'Desde la Edad Media hasta el siglo XX.',
    price: 42,
    status: 'active',
    finishedAt: null,
    article: {
      category: 'Libros',
      condition: 'Usado',
      characteristics: {
        category: 'Libros',
        title: 'Historia de la Música Occidental',
        author: 'Donald Grout',
        theme: 'Historia de la música',
        edition: '5ª',
        publisher: 'Norton',
        year: '2005',
        pages: 900,
        language: 'Español',
        isbn: '9780393979994'
      }
    }
  },

  // Otros
  {

    title: 'Decoración temática musical de pared',
    description: 'Ideal para estudios de música.',
    price: 20,
    status: 'active',
    finishedAt: null,
    article: {
      category: 'Otros',
      condition: 'Nuevo',
      characteristics: {
        category: 'Otros',
        description: 'Vinilo decorativo con notas musicales'
      }
    }
  },
  {

    title: 'Llavero en forma de guitarra',
    description: 'Accesorio divertido para músicos.',
    price: 5,
    status: 'active',
    finishedAt: null,
    article: {
      category: 'Otros',
      condition: 'Nuevo',
      characteristics: {
        category: 'Otros',
        description: 'Llavero metálico en forma de guitarra eléctrica.'
      }
    }
  },
  {

    title: 'Piano acústico Yamaha U1',
    description: 'Piano vertical de estudio, gran calidad sonora.',
    price: 3200,
    status: 'active',
    finishedAt: null,
    article: {
      category: 'Instrumentos',
      condition: "Restaurado",
      characteristics: {
        category: 'Instrumentos',
        type: "Teclados",
        brand: 'Yamaha',
        model: 'U1',
        color: 'Negro',
        fabricationYear: '1990',
        serialNumber: 'YAMU1234',
        instrumentLevel: "Avanzado"
      }
    }
  },
  {

    title: 'Trompeta Bach Stradivarius',
    description: 'Instrumento profesional para músicos de orquesta.',
    price: 1800,
    status: 'active',
    finishedAt: null,
    article: {
      category: 'Instrumentos',
      condition: 'Bueno',
      characteristics: {
        category: 'Instrumentos',
        type: "Viento metal",
        brand: 'Bach',
        model: 'Stradivarius 180S37',
        color: 'Plateado',
        fabricationYear: '2010',
        serialNumber: 'BACHTP123',
        instrumentLevel: "Avanzado"
      }
    }
  },

  // Grabaciones
  {

    title: 'Thriller - Michael Jackson (Vinilo)',
    description: 'Edición coleccionista en perfecto estado.',
    price: 60,
    status: 'active',
    finishedAt: null,
    article: {
      category: 'Grabaciones',
      condition: 'Bueno',
      characteristics: {
        category: 'Grabaciones',
        format: 'Vinilo',
        recordingTitle: 'Thriller',
        artist: 'Michael Jackson',
        genre: 'Pop',
        year: '1982',
        label: 'Epic',
        catalogNumber: 'QE 38112'
      }
    }
  },

  // Accesorios
  {

    title: 'Soporte universal para guitarra',
    description: 'Soporte plegable y resistente.',
    price: 18,
    status: 'active',
    finishedAt: null,
    article: {
      category: 'Accesorios',
      condition: 'Nuevo',
      characteristics: {
        category: 'Accesorios',
        type: 'Atril',
        name: 'Soporte plegable universal',
        brand: 'Hercules',
        associatedInstrument: 'Guitarra'
      }
    }
  },

  // Profesional
  {

    title: 'Monitores de estudio KRK Rokit 5',
    description: 'Sonido plano y preciso para producción musical.',
    price: 250,
    status: 'active',
    finishedAt: null,
    article: {
      category: 'Profesional',
      condition: 'Bueno',
      characteristics: {
        category: 'Profesional',
        name: 'Rokit 5 G4',
        brand: 'KRK',
        model: 'G4',
        color: 'Negro',
        fabricationYear: '2019',
        warranty: 'No'
      }
    }
  },

  // Libros
  {

    title: 'Método Suzuki para violín - Volumen 1',
    description: 'Perfecto para niños que inician en el violín.',
    price: 15,
    status: 'active',
    finishedAt: null,
    article: {
      category: 'Libros',
      condition: 'Nuevo',
      characteristics: {
        category: 'Libros',
        title: 'Método Suzuki - Vol. 1',
        author: 'Shinichi Suzuki',
        theme: 'Métodos de estudio',
        edition: 'Edición Internacional',
        publisher: 'Alfred Music',
        year: '2010',
        pages: 32,
        language: 'Español',
        isbn: '9780739014904'
      }
    }
  },

  // Otros
  {

    title: 'Póster educativo de acordes de guitarra',
    description: 'Útil para salas de ensayo o clases.',
    price: 10,
    status: 'active',
    finishedAt: null,
    article: {
      category: 'Otros',
      condition: 'Nuevo',
      characteristics: {
        category: 'Otros',
        description: 'Póster tamaño A2 con acordes mayores, menores y séptimos.'
      }
    }
  },

  // Otro instrumento más
  {

    title: 'Saxofón alto Yamaha YAS-280',
    description: 'Ideal para estudiantes de nivel intermedio.',
    price: 950,
    status: 'active',
    finishedAt: null,
    article: {
      category: 'Instrumentos',
      condition: 'Bueno',
      characteristics: {
        category: 'Instrumentos',
        type: 'Viento madera',
        brand: 'YamahaWind',
        model: 'YAS-280',
        fabricationYear: '2018',
        color: 'Oro lacado',
        serialNumber: 'YAMW2023',
        instrumentLevel: 'Intermedio'
      }
    }
  },

  // Otro libro más
  {

    title: 'Composición musical avanzada',
    description: 'Manual para compositores con experiencia.',
    price: 38,
    status: 'active',
    finishedAt: null,
    article: {
      category: 'Libros',
      condition: 'Nuevo',
      characteristics: {
        category: 'Libros',
        title: 'Composición avanzada',
        author: 'Arnold Schoenberg',
        theme: 'Composición',
        publisher: 'Universal Edition',
        year: '2000',
        pages: 450,
        language: 'Español',
        isbn: '9783702413339'
      }
    }
  }
]