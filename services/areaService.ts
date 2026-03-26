import type { ApiResponse } from '~/types/api';
import type { AreaListParams, AreaUpsertPayload, AreaListData } from '~/types/area';
type ApiFetch = <T>(endpoint: string, options?: object) => Promise<ApiResponse<T>>;

const ENDPOINTS = {
    list: '/area',
    create: '/area',
    update: (id: string) => `/area/${id}`,
    detail: (id: string) => `/area/${id}`,
    remove: (id: string) => `/area/${id}`,
};

export const areaService = (apiFetch: ApiFetch) => ({
    list: (params: AreaListParams) =>
        apiFetch<AreaListData>(ENDPOINTS.list, {
            method: 'GET',
            params,
        }),

    create: (payload: AreaUpsertPayload) => apiFetch<unknown>(ENDPOINTS.create, { method: 'POST', body: payload }),

    update: (id: string, payload: AreaUpsertPayload) => apiFetch<unknown>(ENDPOINTS.update(id), { method: 'PATCH', body: payload }),

    findOne: (id: string) => apiFetch<unknown>(ENDPOINTS.detail(id), { method: 'GET' }),
    remove: (id: string) => apiFetch<unknown>(ENDPOINTS.remove(id), { method: 'DELETE' }),
});
