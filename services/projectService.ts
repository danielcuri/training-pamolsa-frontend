import type { ApiResponse } from '~/types/api';
import type { ProjectUpsertPayload } from '~/types/project';
type ApiFetch = <T>(endpoint: string, options?: object) => Promise<ApiResponse<T>>;

const ENDPOINTS = {
    list: '/project',
    create: '/project',
    update: (id: string) => `/project/${id}`,
    detail: (id: string) => `/project/${id}`,
    remove: (id: string) => `/project/${id}`,
};

export const projectService = (apiFetch: ApiFetch) => ({
    list: (params: Record<string, unknown>) => apiFetch<unknown>(ENDPOINTS.list, { method: 'GET', params }),

    create: (payload: ProjectUpsertPayload) => apiFetch<unknown>(ENDPOINTS.create, { method: 'POST', body: payload }),

    update: (id: string, payload: ProjectUpsertPayload) => apiFetch<unknown>(ENDPOINTS.update(id), { method: 'PATCH', body: payload }),

    findOne: (id: string) => apiFetch<unknown>(ENDPOINTS.detail(id), { method: 'GET' }),
    remove: (id: string) => apiFetch<unknown>(ENDPOINTS.remove(id), { method: 'DELETE' }),
});
