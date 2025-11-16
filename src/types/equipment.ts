export interface Equipment {
  id: string;
  name: string;
  description?: string | null;
  price: string;
  stock: number;
  category?: string | null;
  created_at: string;
  owner?: string | null;
}
