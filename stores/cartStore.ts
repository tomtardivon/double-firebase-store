import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { CartItem } from '@/types';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, updates: Partial<CartItem>) => void;
  clearCart: () => void;
  toggleCart: () => void;
  
  getTotal: () => number;
  getItemsCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      
      addItem: (item) => {
        const id = Math.random().toString(36).substring(7);
        set((state) => ({
          items: [...state.items, { ...item, id }],
          isOpen: true,
        }));
      },
      
      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },
      
      updateItem: (id, updates) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          ),
        }));
      },
      
      clearCart: () => {
        set({ items: [], isOpen: false });
      },
      
      toggleCart: () => {
        set((state) => ({ isOpen: !state.isOpen }));
      },
      
      getTotal: () => {
        return get().items.reduce((total, item) => total + item.price, 0);
      },
      
      getItemsCount: () => {
        return get().items.length;
      },
    }),
    {
      name: 'smarteen-cart',
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          const value = Cookies.get(name);
          return value || null;
        },
        setItem: (name, value) => {
          Cookies.set(name, value, { 
            expires: 7,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
          });
        },
        removeItem: (name) => {
          Cookies.remove(name);
        },
      })),
    }
  )
);