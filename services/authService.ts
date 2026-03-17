import type { ApiResponse, LoginResponse, User } from '~/types/api';

type ApiFetch = <T>(endpoint: string, options?: object) => Promise<ApiResponse<T>>;

export const authService = (apiFetch: ApiFetch) => ({
    login: (email: string, password: string) =>
        apiFetch<LoginResponse>('/auth/login', {
            method: 'POST',
            body: { email, password },
        }),

    getProfile: () => apiFetch<User>('/auth/profile'),

    logout: () => apiFetch('/auth/logout', { method: 'POST' }),
});
