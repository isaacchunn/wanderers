import { create } from "zustand";

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

interface User {
    id: string;
    username: string;
    email: string;
    emailVerified: string;
}

interface UserState {
    user: User | null;
    isUserFetched: boolean;
    fetchUserData: (userId: string) => Promise<void>;
    setUser: (user: User | null) => void;
    clearUser: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
    user: null,
    isUserFetched: false,
    fetchUserData: async (userId: string) => {
        if (get().isUserFetched) return;
        console.log("Fetching user data");
        try {
            if (userId) {
                const response = await fetch(`${baseUrl}/api/user/${userId}`);
                const data = await response.json();
                set({ user: data, isUserFetched: true });
            }
        } catch (error) {
            console.error("Error fetching user data: ", error);
        }
    },
    setUser: (user: User | null) => set({ user }),
    clearUser: () => set({ user: null }),
}));
