// composables/useAreas.ts
import { computed, onMounted, reactive, ref } from 'vue';

import { areaService } from '~/services/areaService';
import { areaSchema } from '~/schemas/area.schema';
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import type { Area, AreaApiStatus, AreaListParams } from '~/types/area';
import { useFormSubmit } from './useFormSubmit';

export const useAreas = () => {
    const { apiFetch } = useApiFetch();
    const svc = areaService(apiFetch);
    const { submit } = useFormSubmit();

    // --------------- list state ---------------

    const loading = ref(false);
    const error = ref<string | null>(null);
    const areas = ref<Area[]>([]);

    // Filtros reactivos (opcionales)
    const filters = reactive({
        projectId: '' as string | undefined,
        status: '' as AreaApiStatus | '',
        search: '', // para name__like
    });

    const pagination = reactive({
        page: 1,
        limit: 10,
        total: 0,
    });

    const totalPages = computed(() => {
        if (!pagination.total || pagination.total <= 0) return 1;
        return Math.max(1, Math.ceil(pagination.total / pagination.limit));
    });

    // --------------- form state ---------------

    const isModalOpen = ref(false);
    const modalMode = ref<'create' | 'edit'>('create');
    const saving = ref(false);
    const formError = ref<string | null>(null);
    const editingId = ref<string | null>(null);

    const { handleSubmit, resetForm, setValues, errors, defineField } = useForm({
        validationSchema: toTypedSchema(areaSchema),
        initialValues: {
            name: '',
            status: 'ACTIVE' as AreaApiStatus,
            projectId: '',
        },
    });

    const [name, nameAttrs] = defineField('name');
    const [status, statusAttrs] = defineField('status');
    const [projectId, projectIdAttrs] = defineField('projectId');

    // --------------- helpers ---------------

    const normalizeArea = (raw: any, index: number, page: number, limit: number): Area | null => {
        const id = raw?.id ?? raw?._id ?? raw?.uuid;
        const rawName = raw?.name;
        const rawStatus = raw?.status;
        const rawProjectId = raw?.projectId ?? raw?.project?.id;
        const project = raw?.project;

        if (id == null || rawName == null) return null;

        return {
            id: String(id),
            name: String(rawName),
            status: rawStatus,
            projectId: String(rawProjectId),
            project: project
                ? {
                      id: String(project.id),
                      name: String(project.name),
                      status: project.status,
                  }
                : undefined,
            rowIndex: (page - 1) * limit + index + 1,
        };
    };

    // Construir query params para el listado
    const buildListParams = (): AreaListParams => {
        const params: AreaListParams = {
            page: pagination.page,
            limit: pagination.limit,
        };

        // projectId como query param separado (opcional)
        if (filters.projectId) {
            params.projectId = filters.projectId;
        }

        // Construir objeto filter solo si hay filtros
        const filterObj: Record<string, unknown> = {};

        if (filters.status) {
            filterObj.status = filters.status;
        }

        if (filters.search) {
            filterObj.name__like = filters.search;
        }

        // Solo enviar filter si tiene propiedades
        if (Object.keys(filterObj).length > 0) {
            params.filter = JSON.stringify(filterObj);
        }

        return params;
    };

    const extractFromResponse = (res: any) => {
        const apiData = res?.data;
        const meta = res?.meta ?? apiData?.meta ?? {};

        const itemsRaw = Array.isArray(apiData) ? apiData : (apiData?.items ?? apiData?.list ?? apiData?.data ?? apiData?.results ?? []);

        const page = meta?.page ?? pagination.page;
        const limit = meta?.limit ?? pagination.limit;
        const total = meta?.total ?? meta?.totalItems ?? 0;

        const items = Array.isArray(itemsRaw) ? itemsRaw.map((raw: any, index: number) => normalizeArea(raw, index, page, limit)).filter(Boolean) : [];

        return { items, page, limit, total };
    };

    // --------------- filter actions ---------------

    const setFilter = (key: keyof typeof filters, value: string | AreaApiStatus) => {
        filters[key] = value as any;
        pagination.page = 1; // Reset a página 1 al filtrar
    };

    const clearFilters = () => {
        filters.projectId = '';
        filters.status = '';
        filters.search = '';
        pagination.page = 1;
    };

    const applyFilters = async () => {
        await loadAreas();
    };

    // --------------- modal actions ---------------

    const openCreate = (preselectedProjectId?: string) => {
        modalMode.value = 'create';
        editingId.value = null;
        formError.value = null;
        resetForm();

        // Si viene preseleccionado un proyecto (ej: desde vista de proyecto)
        if (preselectedProjectId) {
            setValues({
                projectId: preselectedProjectId,
            });
        }

        isModalOpen.value = true;
    };

    const openEdit = (area: Area) => {
        console.log({ area });
        modalMode.value = 'edit';
        editingId.value = area.id;
        formError.value = null;
        resetForm();
        setValues({
            name: area.name,
            status: area.status,
            projectId: area.projectId,
        });
        isModalOpen.value = true;
    };

    const closeModal = () => {
        if (saving.value) return;
        isModalOpen.value = false;
        editingId.value = null;
        formError.value = null;
        resetForm();
    };

    // --------------- data actions ---------------

    const loadAreas = async () => {
        loading.value = true;
        error.value = null;

        try {
            const params = buildListParams();
            const res = await svc.list(params);

            if (res.status && res.data) {
                const extracted = extractFromResponse(res);
                areas.value = extracted.items as Area[];
                pagination.page = extracted.page;
                pagination.limit = extracted.limit;
                pagination.total = extracted.total;
            } else {
                areas.value = [];
                pagination.total = 0;
            }
        } catch (e: any) {
            error.value = e?.data?.message ?? 'Error al cargar áreas';
            areas.value = [];
            pagination.total = 0;
        } finally {
            loading.value = false;
        }
    };

    const changePage = async (newPage: number) => {
        const p = Math.max(1, Math.min(totalPages.value, newPage));
        if (p === pagination.page) return;
        pagination.page = p;
        await loadAreas();
    };

    const changeLimit = async (newLimit: number) => {
        const validLimits = [10, 20, 50, 100];
        const limit = validLimits.includes(newLimit) ? newLimit : 10;

        if (limit === pagination.limit) return;

        pagination.limit = limit;
        pagination.page = 1;
        await loadAreas();
    };

    // --------------- submit ---------------

    const onSubmit = handleSubmit(async (values) => {
        await submit({
            payload: () => ({
                name: values.name,
                status: values.status as AreaApiStatus,
                projectId: values.projectId,
            }),
            onCreate: (payload) => svc.create(payload),
            onUpdate: (id, payload) => svc.update(id, payload),
            editingId,
            modalMode,
            saving,
            formError,
            successMessage: {
                create: 'Área creada correctamente.',
                update: 'Área actualizada correctamente.',
            },
            onSuccess: async () => {
                closeModal();
                await loadAreas();
            },
        });
    });

    onMounted(() => {
        loadAreas();
    });

    return {
        // list
        loading,
        error,
        areas,
        pagination,
        totalPages,
        filters,
        // modal state
        isModalOpen,
        modalMode,
        saving,
        formError,
        // form fields
        name,
        nameAttrs,
        status,
        statusAttrs,
        projectId,
        projectIdAttrs,
        errors,
        // filter actions
        setFilter,
        clearFilters,
        applyFilters,
        // pagination
        changePage,
        changeLimit,
        // modal actions
        openCreate,
        openEdit,
        closeModal,
        onSubmit,
    };
};
