import create from "zustand";

// eslint-disable-next-line no-unused-vars
const useCartStore = create((set) => ({
  cart: [],
  setCart: (cart) => set({ cart }),
  clearCart: () => set({ cart: [] }),
  removeProduct: (productId) =>
    set((state) => ({
      cart: state.cart.filter((product) => product._id !== productId),
    })),
}));
