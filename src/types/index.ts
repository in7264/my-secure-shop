export interface User {
  id: string;
  email: string;
  role: string;
}

export interface Equipment {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  main_image?: string;
  images?: string[];
  created_at: string;
  total_views: number;
}

export interface Category {
  name: string;
}

export interface CartItem {
  id: number;
  quantity: number;
  equipment: {
    id: number;
    name: string;
    price: number;
    main_image?: string;
    stock: number;
  };
}

export interface Favorite {
  id: number;
  equipment: {
    id: number;
    name: string;
    description: string;
    price: number;
    stock: number;
    main_image?: string;
    category: string;
  };
}

export interface CartPageProps {
  cartItems: CartItem[];
  onUpdateCart: (equipmentId: number, quantity: number) => void;
  onRemoveFromCart: (equipmentId: number) => void;
}

export interface EquipmentDetailProps {
  onAddToCart: (equipment: Equipment, quantity: number) => void;
  onRemoveFromCart: (equipmentId: number) => void;
  onUpdateCartQuantity: (equipmentId: number, quantity: number) => void;
  cartItems: CartItem[];
  favorites: Favorite[];
  onTrackView: (equipmentId: number) => Promise<void>
}

export interface AnalyticsData {
  totalProducts: number;
  totalViews: number;
  totalOrders: number;
  lowStock: number;
  categories: string[];
  popularProducts: Array<{
    id: number;
    name: string;
    views: number;
    orders: number;
    stock: number;
    price: number;
  }>;
  recentPriceChanges: Array<{
    equipment_id: number;
    old_price: number;
    new_price: number;
    changed_at: string;
  }>;
  salesByCategory: Record<string, number>;
  dailyViews: Record<string, number>;
}
