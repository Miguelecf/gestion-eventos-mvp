import axios from "axios";

// Configuración base de axios
const api = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
	withCredentials: false, // usa true si manejas cookies httpOnly en el backend
});

// Persistencia simple en localStorage
const TOKENS_KEY = "auth.tokens";

export type Tokens = {
	accessToken: string;
	refreshToken: string;
	expiresAt?: string; // ISO opcional
};

export function getStoredTokens(): Tokens | null {
	const raw = localStorage.getItem(TOKENS_KEY);
	return raw ? JSON.parse(raw) : null;
}

export function setStoredTokens(tokens: Tokens | null) {
	if (!tokens) return localStorage.removeItem(TOKENS_KEY);
	localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
}

// Inserta Authorization si hay accessToken
api.interceptors.request.use((config) => {
	const tokens = getStoredTokens();
	if (tokens?.accessToken) {
		config.headers = config.headers || {};
		config.headers["Authorization"] = `Bearer ${tokens.accessToken}`;
	}
	return config;
});

// Refresh automático en 401 (si hay refreshToken)
let isRefreshing = false;
let pendingQueue: Array<(token: string | null) => void> = [];

function processQueue(newAccess: string | null) {
	pendingQueue.forEach((cb) => cb(newAccess));
	pendingQueue = [];
}

api.interceptors.response.use(
	(res) => res,
	async (error) => {
		const original = error.config;
		if (error.response?.status === 401 && !original._retry) {
			const tokens = getStoredTokens();
			if (!tokens?.refreshToken) throw error;

			if (isRefreshing) {
				// Espera a que termine el refresh en curso
				return new Promise((resolve, reject) => {
					pendingQueue.push((newAccess) => {
						if (!newAccess) return reject(error);
						original.headers = original.headers || {};
						original.headers["Authorization"] = `Bearer ${newAccess}`;
						resolve(api(original));
					});
				});
			}

			original._retry = true;
			isRefreshing = true;
			try {
				// Llama al endpoint de refresh
				const response = await api.post("/auth/refresh", {
					refreshToken: tokens.refreshToken,
				});
				const newTokens: Tokens = response.data;
				setStoredTokens(newTokens);
				processQueue(newTokens.accessToken);
				original.headers = original.headers || {};
				original.headers["Authorization"] = `Bearer ${newTokens.accessToken}`;
				return api(original);
			} catch (err) {
				setStoredTokens(null);
				processQueue(null);
				return Promise.reject(err);
			} finally {
				isRefreshing = false;
			}
		}
		return Promise.reject(error);
	}
);

export default api;