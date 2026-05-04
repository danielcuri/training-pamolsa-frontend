import type { ApiResponse } from '~/types/api';
import type { TrainingTemplateListData, TrainingTemplateListParams, TrainingTemplateUpsertPayload } from '~/types/trainingTemplate';

type ApiFetch = <T>(endpoint: string, options?: object) => Promise<ApiResponse<T>>;

const ENDPOINTS = {
    list: '/training-template',
    create: '/training-template',
    update: (id: string) => `/training-template/${id}`,
    detail: (id: string) => `/training-template/${id}`,
    remove: (id: string) => `/training-template/${id}`,
};

export const trainingTemplateService = (apiFetch: ApiFetch) => ({
    list: (params: TrainingTemplateListParams) =>
        apiFetch<TrainingTemplateListData>(ENDPOINTS.list, {
            method: 'GET',
            params,
        }),

    create: (payload: TrainingTemplateUpsertPayload) =>
        apiFetch<unknown>(ENDPOINTS.create, { method: 'POST', body: payload }),

    update: (id: string, payload: TrainingTemplateUpsertPayload) =>
        apiFetch<unknown>(ENDPOINTS.update(id), { method: 'PATCH', body: payload }),

    findOne: (id: string) => apiFetch<unknown>(ENDPOINTS.detail(id), { method: 'GET' }),
    remove: (id: string) => apiFetch<unknown>(ENDPOINTS.remove(id), { method: 'DELETE' }),
});
