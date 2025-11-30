export interface Equipment {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  created_at: string;
  total_views: number;
  images?: string[];
}

export interface Category {
  name: string;
}
