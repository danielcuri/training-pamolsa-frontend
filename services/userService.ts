import type { ApiResponse } from '~/types/api';
import type { UserListData, UserListParams, UserUpsertPayload } from '~/types/user';

type ApiFetch = <T>(endpoint: string, options?: object) => Promise<ApiResponse<T>>;

const ENDPOINTS = {
    list: '/user',
    create: '/user',
    update: (id: string) => `/user/${id}`,
    detail: (id: string) => `/user/${id}`,
    remove: (id: string) => `/user/${id}`,
};

export const userService = (apiFetch: ApiFetch) => ({
    list: (params: UserListParams) =>
        apiFetch<UserListData>(ENDPOINTS.list, {
            method: 'GET',
            params,
        }),

    create: (payload: UserUpsertPayload) => apiFetch<unknown>(ENDPOINTS.create, { method: 'POST', body: payload }),

    update: (id: string, payload: UserUpsertPayload) => apiFetch<unknown>(ENDPOINTS.update(id), { method: 'PATCH', body: payload }),

    findOne: (id: string) => apiFetch<unknown>(ENDPOINTS.detail(id), { method: 'GET' }),
    remove: (id: string) => apiFetch<unknown>(ENDPOINTS.remove(id), { method: 'DELETE' }),
});
