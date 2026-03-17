// types/api.ts
export interface ApiResponse<T = unknown> {
    statusCode: number;
    message: string;
    status: boolean;
    data?: T;
}

export interface User {
    id: string;
    name: string;
    email: string;
    dni: string | null;
    educationLevel: string | null;
    hireDate: string | null;
    role: string;
    status: string;
    projectId: string | null;
    areaId: string | null;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
}

export interface LoginResponse {
    user: User;
    token: string;
}
