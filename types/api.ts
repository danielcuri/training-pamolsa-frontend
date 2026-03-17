export interface ApiResponse<T = unknown> {
    statusCode: number;
    message: string;
    status: boolean;
    data?: T;
}

export interface User {
    id: string;
    email: string;
    name: string;
    role: string;
}

export interface LoginResponse {
    user: User;
    token: string;
}
