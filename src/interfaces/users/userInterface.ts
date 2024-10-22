export interface User {
    id: number;
    email: string;
    username: string;
    rol: "ADMIN" | "CLIENT";
    token?: string;
}

export interface UserByEmail {
    email: string;
}

export interface LoginArgs {
    username: string;
    password: string;
}

export class UserNotFoundError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'UserNotFoundError';
    }
}

export interface ResetPasswordArgs {
    newPassword: string;
    token: string;
}

export interface DecodedToken {
    userId: number;
}
