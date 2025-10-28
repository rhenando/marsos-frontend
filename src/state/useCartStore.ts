import { create } from "zustand";

interface CartItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface CartState {
  cartItems: CartItem[];
  cartCount: number;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  cartItems: [],
  cartCount: 0,

  addItem: (item) => {
    const items = [...get().cartItems];
    const existing = items.find((i) => i.id === item.id);

    if (existing) {
      existing.quantity += item.quantity;
    } else {
      items.push(item);
    }

    set({
      cartItems: items,
      cartCount: items.reduce((sum, i) => sum + i.quantity, 0),
    });
  },

  removeItem: (id) => {
    const filtered = get().cartItems.filter((i) => i.id !== id);
    set({
      cartItems: filtered,
      cartCount: filtered.reduce((sum, i) => sum + i.quantity, 0),
    });
  },

  clearCart: () => set({ cartItems: [], cartCount: 0 }),
}));
