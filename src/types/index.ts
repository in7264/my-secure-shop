export interface User {
  id: string;
  email: string;
  role: string;
  name?: string;
  avatar?: string;
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
  updated_at?: string;
}

export interface EquipmentFormData {
  name: string;
  description: string;
  price: string;
  stock: string;
  category: string;
  images: string;
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

export interface DailyViewData {
  date: string;
  views: number;
}

export interface CategorySalesData {
  category: string;
  sales: number;
}

export interface PopularProduct {
  name: string;
  views: number;
  orders: number;
}

export interface PriceChange {
  productName: string;
  oldPrice: number;
  newPrice: number;
  date: string;
}

export interface AnalyticsData {
  totalProducts: number;
  totalViews: number;
  totalOrders: number;
  lowStock: number;
  categories: string[];
  popularProducts: PopularProduct[];
  recentPriceChanges: PriceChange[];
  salesByCategory: Record<string, number>;
  dailyViews: Record<string, number>;
}

// Для AppContext
export interface AppState {
  user: User | null;
  cartItems: CartItem[];
  favorites: Favorite[];
  equipment: Equipment[];
  categories: Category[];
}

export type AppAction =
  | { type: "SET_USER"; payload: User | null }
  | { type: "SET_CART_ITEMS"; payload: CartItem[] }
  | { type: "ADD_TO_CART"; payload: CartItem }
  | { type: "REMOVE_FROM_CART"; payload: number }
  | {
      type: "UPDATE_CART_QUANTITY";
      payload: { equipmentId: number; quantity: number };
    }
  | { type: "SET_FAVORITES"; payload: Favorite[] }
  | { type: "SET_EQUIPMENT"; payload: Equipment[] }
  | { type: "SET_CATEGORIES"; payload: Category[] }
  | { type: "LOGOUT" };
