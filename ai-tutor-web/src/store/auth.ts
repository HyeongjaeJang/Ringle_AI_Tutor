import { create } from "zustand";

type User = { id: number; email: string; name: string; role: "user" | "admin" };
type AuthState = {
  user: User | null;
  setUser: (user: User | null) => void;
  clear: () => void;
};

export const useAuth = create<AuthState>((set) => ({
  user:
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user") || "null")
      : null,
  setUser: (user) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(user));
    }
    set({ user });
  },
  clear: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
    }
    set({ user: null });
  },
}));
