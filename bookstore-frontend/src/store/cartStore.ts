import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type CartItem = {
  id: string;
  title: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
};

type CartState = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((entry) => entry.id === item.id);

          if (existing) {
            return {
              items: state.items.map((entry) =>
                entry.id === item.id
                  ? { ...entry, imageUrl: item.imageUrl || entry.imageUrl, quantity: entry.quantity + item.quantity }
                  : entry
              ),
            };
          }

          return { items: [...state.items, item] };
        }),
      removeItem: (id) => set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'bookstore-cart',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
