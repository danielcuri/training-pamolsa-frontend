// composables/useApiFetch.ts
import type { ApiResponse } from '~/types/api';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

interface ApiFetchOptions {
    method?: HttpMethod;
    body?: Record<string, unknown>;
    params?: Record<string, unknown>;
    headers?: Record<string, string>;
}

export const useApiFetch = () => {
    const config = useRuntimeConfig();
    const authStore = useAuthStore();

    const apiFetch = async <T>(endpoint: string, options: ApiFetchOptions = {}): Promise<ApiResponse<T>> => {
        const headers: Record<string, string> = {
            ...(options.headers ?? {}),
        };

        if (authStore.token) {
            headers['Authorization'] = `Bearer ${authStore.token}`;
        }

        try {
            return await $fetch<ApiResponse<T>>(endpoint, {
                baseURL: config.public.apiBase as string,
                method: options.method,
                body: options.body,
                params: options.params,
                headers,
            });
        } catch (error: any) {
            if (error?.response?.status === 401) {
                authStore.logout();
                await navigateTo('/auth');
            }
            throw error;
        }
    };

    return { apiFetch };
};
