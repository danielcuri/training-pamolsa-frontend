import type { ApiResponse } from '~/types/api';
import type { TemplateOperationListData, TemplateOperationListParams, TemplateOperationUpsertPayload } from '~/types/templateOperation';

type ApiFetch = <T>(endpoint: string, options?: object) => Promise<ApiResponse<T>>;

const ENDPOINTS = {
    list: (templateId: string) => `/training-template/${templateId}/template-operation`,
    create: (templateId: string) => `/training-template/${templateId}/template-operation`,
    update: (templateId: string, id: string) => `/training-template/${templateId}/template-operation/${id}`,
    detail: (templateId: string, id: string) => `/training-template/${templateId}/template-operation/${id}`,
    remove: (templateId: string, id: string) => `/training-template/${templateId}/template-operation/${id}`,
};

export const templateOperationService = (apiFetch: ApiFetch) => ({
    list: (templateId: string, params: TemplateOperationListParams) =>
        apiFetch<TemplateOperationListData>(ENDPOINTS.list(templateId), {
            method: 'GET',
            params,
        }),

    create: (templateId: string, payload: TemplateOperationUpsertPayload) =>
        apiFetch<unknown>(ENDPOINTS.create(templateId), { method: 'POST', body: payload }),

    update: (templateId: string, id: string, payload: TemplateOperationUpsertPayload) =>
        apiFetch<unknown>(ENDPOINTS.update(templateId, id), { method: 'PATCH', body: payload }),

    findOne: (templateId: string, id: string) =>
        apiFetch<unknown>(ENDPOINTS.detail(templateId, id), { method: 'GET' }),

    remove: (templateId: string, id: string) =>
        apiFetch<unknown>(ENDPOINTS.remove(templateId, id), { method: 'DELETE' }),
});
