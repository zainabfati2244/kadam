export type Gender = 'Men' | 'Women' | 'Unisex' | 'Kids';

export type Category = 'Sneakers' | 'Formal' | 'Sports' | 'Casual' | 'Boots' | 'Running';

export type Brand = 'Nike' | 'Adidas' | 'Puma' | 'Jordan' | 'New Balance' | 'Reebok';

export type SortOption =
  | 'newest'
  | 'price_asc'
  | 'price_desc'
  | 'popularity';

export interface Product {
  id: string;
  name: string;
  price: number;
  brand: Brand;
  category: Category;
  gender: Gender;
  sizes: number[];
  colors: string[]; // hex codes or color names
  colorNames?: string[];
  tag?: string;
  tagColor?: string;
  image: string;
  popularity: number; // rating out of 5
  createdAt: string; // ISO date string
}

export interface FilterState {
  gender: Gender | 'All';
  categories: Category[];
  brands: Brand[];
  sizes: number[];
  colors: string[];
  priceRange: [number, number]; // [min, max]
  sortBy: SortOption;
}

export const DEFAULT_PRICE_RANGE: [number, number] = [0, 10000];

export const INITIAL_FILTER_STATE: FilterState = {
  gender: 'All',
  categories: [],
  brands: [],
  sizes: [],
  colors: [],
  priceRange: DEFAULT_PRICE_RANGE,
  sortBy: 'newest',
};

export const COLOR_OPTIONS = [
  { name: 'Black', hex: '#1E1E1E' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Red', hex: '#E53935' },
  { name: 'Blue', hex: '#1E88E5' },
  { name: 'Brown', hex: '#795548' },
  { name: 'Green', hex: '#4CAF50' },
  { name: 'Gold', hex: '#D4AF37' },
];

export const GENDER_OPTIONS: Array<Gender | 'All'> = ['All', 'Men', 'Women', 'Unisex', 'Kids'];

export const CATEGORY_OPTIONS: Category[] = [
  'Sneakers',
  'Formal',
  'Sports',
  'Casual',
  'Boots',
  'Running',
];

export const BRAND_OPTIONS: Brand[] = [
  'Nike',
  'Adidas',
  'Puma',
  'Jordan',
  'New Balance',
  'Reebok',
];

export const SIZE_OPTIONS: number[] = [38, 39, 40, 41, 42, 43, 44, 45, 46];

export const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: 'Newest Arrivals', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Popularity & Rating', value: 'popularity' },
];
