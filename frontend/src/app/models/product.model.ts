export interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  comparePrice?: number;
  currency: string;
  stock: number;
  isFeatured: boolean;
  isNew: boolean;
  origin?: string;
  shortDesc?: string;
  description?: string;
  images: any[];
  tags: string[];
  weight?: number;
  isActive: boolean;
  totalSold: number;
  avgRating: number;
  numReviews: number;
  createdAt?: string;
  updatedAt?: string;
  reviews?: any[];
}
