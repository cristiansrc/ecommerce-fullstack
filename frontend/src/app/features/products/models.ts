export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number; // In cents or decimal
  stock: number;
  imageUrl?: string;
}

export interface PaginatedProducts {
  content: Product[];
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
}