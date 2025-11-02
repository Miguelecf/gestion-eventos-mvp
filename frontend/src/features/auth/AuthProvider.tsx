import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { AuthApi } from "./api";
import { getStoredTokens, setStoredTokens, type Tokens } from "../../lib/http";
import type { LoginRequest, RegisterRequest, UserSummary } from "./types";


export type AuthContextType = {
user: UserSummary | null;
tokens: Tokens | null;
loading: boolean;
login: (data: LoginRequest) => Promise<void>;
register: (data: RegisterRequest) => Promise<void>;
logout: () => Promise<void>;
refresh: () => Promise<void>;
me: () => Promise<void>;
};


const AuthContext = createContext<AuthContextType | null>(null);


export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<UserSummary | null>(null);
	const [tokens, setTokens] = useState<Tokens | null>(getStoredTokens());
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		(async () => {
			try {
				if (tokens?.accessToken) {
					const u = await AuthApi.me();
					setUser(u);
				}
			} catch {
				setStoredTokens(null);
				setTokens(null);
				setUser(null);
			} finally {
				setLoading(false);
			}
		})();
		// If you want to run only once, leave dependency array empty.
	}, []);

	const login = async (data: LoginRequest) => {
		const res = await AuthApi.login(data);
		const t: Tokens = {
			accessToken: res.accessToken,
			refreshToken: res.refreshToken,
			expiresIn: res.expiresIn,
		};
		setStoredTokens(t);
		setTokens(t);
		setUser(res.user);
	};

	const register = async (data: RegisterRequest) => {
		await AuthApi.register(data);
		// El backend solo devuelve el usuario, no tokens
		setStoredTokens(null);
		setTokens(null);
		setUser(null);
	};

	const logout = async () => {
		await AuthApi.logout(tokens?.refreshToken);
		setStoredTokens(null);
		setTokens(null);
		setUser(null);
	};

	const refresh = async () => {
		if (!tokens?.refreshToken) return;
		const res = await AuthApi.refresh({ refreshToken: tokens.refreshToken });
		const t: Tokens = {
			accessToken: res.accessToken,
			refreshToken: res.refreshToken,
			expiresIn: res.expiresIn,
		};
		setStoredTokens(t);
		setTokens(t);
		const u = await AuthApi.me();
		setUser(u);
	};

	const me = async () => {
		if (!tokens?.accessToken) return;
		const u = await AuthApi.me();
		setUser(u);
	};

	const value = useMemo(() => ({
		user,
		tokens,
		loading,
		login,
		register,
		logout,
		refresh,
		me,
	}), [user, tokens, loading]);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
	}

    export function useAuth() {
        const context = useContext(AuthContext);
        if (!context) {
            throw new Error("useAuth must be used within an AuthProvider");
        }
        return context;
    }

	export { AuthContext };