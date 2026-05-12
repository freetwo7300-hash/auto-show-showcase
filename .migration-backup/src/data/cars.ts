export interface Car {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  condition: "جديد" | "مستعمل";
  color: string;
  fuelType: string;
  transmission: string;
  engine: string;
  bodyType: string;
  description: string;
  images: string[];
  features: string[];
  status: "متاح" | "محجوز" | "مباع";
}

export const BRANDS = ["تويوتا", "مرسيدس", "بي إم دبليو", "هيونداي", "نيسان", "كيا", "شيفروليه", "فورد", "هوندا", "لكزس"];
export const COLORS = ["أبيض", "أسود", "فضي", "رمادي", "أحمر", "أزرق", "أخضر"];
export const BODY_TYPES = ["سيدان", "SUV", "هاتشباك", "كوبيه", "بيك أب", "فان"];

export const carsData: Car[] = [
  {
    id: "1",
    brand: "تويوتا",
    model: "كامري",
    year: 2024,
    price: 135000,
    mileage: 0,
    condition: "جديد",
    color: "أبيض",
    fuelType: "بنزين",
    transmission: "أوتوماتيك",
    engine: "2.5L 4 سلندر",
    bodyType: "سيدان",
    description: "تويوتا كامري 2024 موديل جديد بالكامل، فل كامل مع جميع الكماليات. محرك اقتصادي وأداء ممتاز.",
    images: [],
    features: ["كاميرا خلفية", "شاشة لمس", "بلوتوث", "مثبت سرعة", "حساسات ركن", "فتحة سقف"],
    status: "متاح",
  },
  {
    id: "2",
    brand: "مرسيدس",
    model: "C200",
    year: 2023,
    price: 285000,
    mileage: 15000,
    condition: "مستعمل",
    color: "أسود",
    fuelType: "بنزين",
    transmission: "أوتوماتيك",
    engine: "2.0L تيربو",
    bodyType: "سيدان",
    description: "مرسيدس C200 بحالة ممتازة، صيانة وكالة كاملة، بدون حوادث.",
    images: [],
    features: ["AMG باكج", "كاميرا 360", "شاشة مزدوجة", "مقاعد كهربائية", "إضاءة محيطية", "نظام ملاحة"],
    status: "متاح",
  },
  {
    id: "3",
    brand: "بي إم دبليو",
    model: "X5",
    year: 2024,
    price: 380000,
    mileage: 5000,
    condition: "مستعمل",
    color: "رمادي",
    fuelType: "بنزين",
    transmission: "أوتوماتيك",
    engine: "3.0L 6 سلندر تيربو",
    bodyType: "SUV",
    description: "بي إم دبليو X5 فل أوبشن، دفع رباعي، قوة وفخامة.",
    images: [],
    features: ["دفع رباعي", "بانوراما", "هاربمان كاردون", "مقاعد مُبرّدة", "Head-up Display", "قيادة ذاتية"],
    status: "محجوز",
  },
  {
    id: "4",
    brand: "هيونداي",
    model: "توسان",
    year: 2024,
    price: 115000,
    mileage: 0,
    condition: "جديد",
    color: "أزرق",
    fuelType: "بنزين",
    transmission: "أوتوماتيك",
    engine: "1.6L تيربو",
    bodyType: "SUV",
    description: "هيونداي توسان 2024 الشكل الجديد، تصميم عصري وتقنيات متطورة.",
    images: [],
    features: ["شاشة 10 بوصة", "Apple CarPlay", "حساسات أمامية", "مفتاح ذكي", "إضاءة LED"],
    status: "متاح",
  },
  {
    id: "5",
    brand: "نيسان",
    model: "باترول",
    year: 2023,
    price: 295000,
    mileage: 25000,
    condition: "مستعمل",
    color: "أبيض",
    fuelType: "بنزين",
    transmission: "أوتوماتيك",
    engine: "5.6L V8",
    bodyType: "SUV",
    description: "نيسان باترول بلاتينيوم، القوة والرحابة، مثالي للعائلة والمغامرات.",
    images: [],
    features: ["8 سلندر", "دفع رباعي", "3 صفوف مقاعد", "شاشتين خلفيتين", "تبريد مقاعد", "بوز ساوند"],
    status: "متاح",
  },
  {
    id: "6",
    brand: "كيا",
    model: "K5",
    year: 2024,
    price: 105000,
    mileage: 0,
    condition: "جديد",
    color: "أحمر",
    fuelType: "بنزين",
    transmission: "أوتوماتيك",
    engine: "2.0L",
    bodyType: "سيدان",
    description: "كيا K5 الجديدة كلياً، تصميم رياضي وأداء اقتصادي.",
    images: [],
    features: ["تصميم رياضي", "شاشة لمس", "كاميرا خلفية", "مثبت سرعة ذكي", "مقاعد جلد"],
    status: "متاح",
  },
  {
    id: "7",
    brand: "لكزس",
    model: "ES350",
    year: 2023,
    price: 245000,
    mileage: 10000,
    condition: "مستعمل",
    color: "فضي",
    fuelType: "بنزين",
    transmission: "أوتوماتيك",
    engine: "3.5L V6",
    bodyType: "سيدان",
    description: "لكزس ES350 بريستيج، الفخامة اليابانية في أبهى صورها.",
    images: [],
    features: ["مارك ليفنسون", "مقاعد فنتيليشن", "بانوراما", "نظام أمان متكامل", "شاشة 12 بوصة"],
    status: "متاح",
  },
  {
    id: "8",
    brand: "شيفروليه",
    model: "تاهو",
    year: 2024,
    price: 310000,
    mileage: 0,
    condition: "جديد",
    color: "أسود",
    fuelType: "بنزين",
    transmission: "أوتوماتيك",
    engine: "5.3L V8",
    bodyType: "SUV",
    description: "شيفروليه تاهو 2024 بريمير، الحجم الكبير والقوة الأمريكية.",
    images: [],
    features: ["مقاعد كابتن", "تعليق مغناطيسي", "واي فاي", "شحن لاسلكي", "بوز ساوند 10 سماعات"],
    status: "متاح",
  },
];
