export interface AuthState {
  token: string | null;
  userId: string | null;
}

export const authSlice = {
  name: "auth",
};

