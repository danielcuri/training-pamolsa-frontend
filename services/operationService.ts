import type { ApiResponse } from '~/types/api';
import type { OperationListData, OperationListParams, OperationUpsertPayload } from '~/types/operation';

type ApiFetch = <T>(endpoint: string, options?: object) => Promise<ApiResponse<T>>;

const ENDPOINTS = {
    list: '/operation',
    create: '/operation',
    update: (id: string) => `/operation/${id}`,
    detail: (id: string) => `/operation/${id}`,
    remove: (id: string) => `/operation/${id}`,
};

export const operationService = (apiFetch: ApiFetch) => ({
    list: (params: OperationListParams) =>
        apiFetch<OperationListData>(ENDPOINTS.list, {
            method: 'GET',
            params,
        }),

    create: (payload: OperationUpsertPayload) => apiFetch<unknown>(ENDPOINTS.create, { method: 'POST', body: payload }),

    update: (id: string, payload: OperationUpsertPayload) => apiFetch<unknown>(ENDPOINTS.update(id), { method: 'PATCH', body: payload }),

    findOne: (id: string) => apiFetch<unknown>(ENDPOINTS.detail(id), { method: 'GET' }),
    remove: (id: string) => apiFetch<unknown>(ENDPOINTS.remove(id), { method: 'DELETE' }),
});
