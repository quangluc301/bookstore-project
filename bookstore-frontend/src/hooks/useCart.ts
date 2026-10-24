import { create } from 'zustand';

type CartItem = {
  id: string;
  quantity: number;
  price: number;
};

type CartStore = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
};

export const useCart = create<CartStore>((set) => ({
  items: [],
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  removeItem: (id) => set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
}));
