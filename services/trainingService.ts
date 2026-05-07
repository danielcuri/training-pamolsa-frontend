import type { ApiResponse } from '~/types/api';
import type { TrainingListData, TrainingListParams, TrainingUpsertPayload } from '~/types/training';

type ApiFetch = <T>(endpoint: string, options?: object) => Promise<ApiResponse<T>>;

const ENDPOINTS = {
    list: '/training',
    create: '/training',
    update: (id: string) => `/training/${id}`,
    remove: (id: string) => `/training/${id}`,
};

export const trainingService = (apiFetch: ApiFetch) => ({
    list: (params: TrainingListParams) =>
        apiFetch<TrainingListData>(ENDPOINTS.list, {
            method: 'GET',
            params,
        }),

    create: (payload: TrainingUpsertPayload) =>
        apiFetch<unknown>(ENDPOINTS.create, { method: 'POST', body: payload }),

    update: (id: string, payload: TrainingUpsertPayload) =>
        apiFetch<unknown>(ENDPOINTS.update(id), { method: 'PATCH', body: payload }),

    remove: (id: string) => apiFetch<unknown>(ENDPOINTS.remove(id), { method: 'DELETE' }),
});
