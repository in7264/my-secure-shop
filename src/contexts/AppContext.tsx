import React, { createContext, useContext, useReducer, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import type { CartItem, Favorite } from '../types';

// Типы для состояния
interface AppState {
  user: User | null;
  cartItems: CartItem[];
  favorites: Favorite[];
}

// Типы для действий
type Action =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_CART_ITEMS'; payload: CartItem[] }
  | { type: 'SET_FAVORITES'; payload: Favorite[] }
  | { type: 'ADD_TO_CART'; payload: CartItem }
  | { type: 'REMOVE_FROM_CART'; payload: number } // equipmentId
  | { type: 'UPDATE_CART_QUANTITY'; payload: { equipmentId: number; quantity: number } }
  | { type: 'TOGGLE_FAVORITE'; payload: Favorite }
  | { type: 'LOGOUT' };

// Начальное состояние
const initialState: AppState = {
  user: null,
  cartItems: [],
  favorites: [],
};

// Создаем контексты
const AppStateContext = createContext<AppState | undefined>(undefined);
const AppDispatchContext = createContext<React.Dispatch<Action> | undefined>(undefined);

// Редуктор для управления состоянием
function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    
    case 'SET_CART_ITEMS':
      return { ...state, cartItems: action.payload };
    
    case 'SET_FAVORITES':
      return { ...state, favorites: action.payload };
    
    case 'ADD_TO_CART': {
      const existingItem = state.cartItems.find(
        item => item.equipment.id === action.payload.equipment.id
      );
      
      if (existingItem) {
        return {
          ...state,
          cartItems: state.cartItems.map(item =>
            item.equipment.id === action.payload.equipment.id
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          ),
        };
      }
      
      return {
        ...state,
        cartItems: [...state.cartItems, action.payload],
      };
    }
    
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        cartItems: state.cartItems.filter(item => item.equipment.id !== action.payload),
      };
    
    case 'UPDATE_CART_QUANTITY':
      return {
        ...state,
        cartItems: state.cartItems.map(item =>
          item.equipment.id === action.payload.equipmentId && action.payload.quantity > 0
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    
    case 'TOGGLE_FAVORITE': {
      const isFavorite = state.favorites.some(
        fav => fav.equipment.id === action.payload.equipment.id
      );
      
      if (isFavorite) {
        return {
          ...state,
          favorites: state.favorites.filter(
            fav => fav.equipment.id !== action.payload.equipment.id
          ),
        };
      }
      
      return {
        ...state,
        favorites: [...state.favorites, action.payload],
      };
    }
    
    case 'LOGOUT':
      return {
        user: null,
        cartItems: [],
        favorites: [],
      };
    
    default:
      return state;
  }
}

// Провайдер контекста
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>
        {children}
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
}

// Хуки для использования контекста
export function useAppState() {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppProvider');
  }
  return context;
}

export function useAppDispatch() {
  const context = useContext(AppDispatchContext);
  if (context === undefined) {
    throw new Error('useAppDispatch must be used within an AppProvider');
  }
  return context;
}