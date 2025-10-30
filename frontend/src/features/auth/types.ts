export type RegisterRequest = {
email: string;
password: string;
name?: string;
};


export type RegisterResponse = {
id: string;
email: string;
};


export type LoginRequest = {
email: string;
password: string;
};


export type LoginResponse = {
accessToken: string;
refreshToken: string;
expiresAt?: string;
};


export type ChangePasswordRequest = {
oldPassword: string;
newPassword: string;
};


export type RefreshRequest = {
refreshToken: string;
};


export type UserSummary = {
id: string;
email: string;
name?: string;
roles?: string[];
};