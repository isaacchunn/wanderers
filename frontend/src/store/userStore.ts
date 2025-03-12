import { create } from "zustand";

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

interface User {
    id: string;
    username: string;
    profile_description: string;
    user_photo: string;
    email: string;
    emailVerified: string;
}

interface UserState {
    user: User | null;
    isUserFetched: boolean;
    fetchUserData: (jwtToken: string) => Promise<void>;
    setUser: (user: object) => void;
    clearUser: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
    user: null,
    isUserFetched: false,
    fetchUserData: async (jwtToken: string) => {
        if (get().isUserFetched) return;
        try {
            if (jwtToken) {
                const response = await fetch(`${baseUrl}/api/user`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${jwtToken}`,
                        },
                    }
                );
                const data = await response.json();
                set({ user: data, isUserFetched: true });
            }
        } catch (error) {
            console.error("Error fetching user data: ", error);
        }
    },
    setUser: (values: Partial<User>) => {
        set((state) => ({ user: { ...state.user, ...values } as User }));
    },
    clearUser: () => set({ user: null, isUserFetched: false }),
}));
