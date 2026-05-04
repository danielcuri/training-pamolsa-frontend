import { computed, onMounted, reactive, ref } from 'vue';

import { projectService } from '~/services/projectService';
import { projectSchema } from '~/schemas/project.schema';
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import type { Project, ProjectApiStatus } from '~/types/project';
import { useFormSubmit } from './useFormSubmit';

export const useProjects = () => {
    const { apiFetch } = useApiFetch();
    const svc = projectService(apiFetch);
    const { submit } = useFormSubmit();

    // --------------- list state ---------------

    const loading = ref(false);
    const error = ref<string | null>(null);
    const projects = ref<Project[]>([]);

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
        validationSchema: toTypedSchema(projectSchema),
        initialValues: {
            name: '',
            status: 'ACTIVE' as ProjectApiStatus,
        },
    });

    const [name, nameAttrs] = defineField('name');
    const [status, statusAttrs] = defineField('status');

    // --------------- helpers ---------------

    const normalizeProject = (raw: any, index: number, page: number, limit: number): Project | null => {
        const id = raw?.id ?? raw?._id ?? raw?.uuid ?? raw?.projectId;
        const rawName = raw?.name;
        const rawStatus = raw?.status;

        if (id == null || rawName == null) return null;

        return {
            id: String(id),
            name: String(rawName),
            status: rawStatus,
            rowIndex: (page - 1) * limit + index + 1, // ← Agregado aquí
        };
    };

    const extractFromResponse = (res: any) => {
        const apiData = res?.data;
        const meta = res?.meta ?? apiData?.meta ?? {};

        const itemsRaw = Array.isArray(apiData) ? apiData : (apiData?.items ?? apiData?.list ?? apiData?.data ?? apiData?.results ?? []);

        const page = typeof meta?.page === 'number' ? meta.page : typeof apiData?.page === 'number' ? apiData.page : pagination.page;

        const limit = typeof meta?.limit === 'number' ? meta.limit : typeof apiData?.limit === 'number' ? apiData.limit : pagination.limit;

        const total =
            typeof meta?.total === 'number'
                ? meta.total
                : typeof meta?.totalItems === 'number'
                  ? meta.totalItems
                  : typeof apiData?.total === 'number'
                    ? apiData.total
                    : 0;

        const items = Array.isArray(itemsRaw) ? itemsRaw.map((raw: any, index: number) => normalizeProject(raw, index, page, limit)).filter(Boolean) : [];

        return { items, page, limit, total };
    };

    // --------------- modal actions ---------------

    const openCreate = () => {
        modalMode.value = 'create';
        editingId.value = null;
        formError.value = null;
        resetForm();
        isModalOpen.value = true;
    };

    const openEdit = (project: Project) => {
        console.log(103);
        modalMode.value = 'edit';
        editingId.value = project.id;
        formError.value = null;
        resetForm();
        setValues({
            name: project.name,
            status: project.status,
        });
        isModalOpen.value = true;
    };

    const closeModal = (force = false) => {
        if (saving.value && !force) return;
        isModalOpen.value = false;
        editingId.value = null;
        formError.value = null;
        resetForm();
    };

    // --------------- data actions ---------------

    const loadProjects = async () => {
        loading.value = true;
        error.value = null;

        try {
            const res = await svc.list({ page: pagination.page, limit: pagination.limit });

            if (res.status && res.data) {
                const extracted = extractFromResponse(res);
                projects.value = extracted.items as Project[];
                pagination.page = extracted.page;
                pagination.limit = extracted.limit;
                pagination.total = extracted.total;
            } else {
                projects.value = [];
                pagination.total = 0;
            }
        } catch (e: any) {
            error.value = e?.data?.message ?? 'Error al cargar proyectos';
            projects.value = [];
            pagination.total = 0;
        } finally {
            loading.value = false;
        }
    };
    const loadAll = async () => {
        loading.value = true;
        error.value = null;

        try {
            const res = await svc.list({ page: 1, limit: 100 });

            if (res.status && res.data) {
                // Usa tu extractFromResponse existente
                console.log({ res });
                const extracted = extractFromResponse(res);

                projects.value = extracted.items as Project[];
            }
        } catch (e: any) {
            error.value = e?.data?.message ?? 'Error al cargar proyectos';
        } finally {
            loading.value = false;
        }
    };

    const changePage = async (newPage: number) => {
        const p = Math.max(1, Math.min(totalPages.value, newPage));
        if (p === pagination.page) return;
        pagination.page = p;
        await loadProjects();
    };
    const changeLimit = async (newLimit: number) => {
        // Validar que el límite sea válido
        const validLimits = [10, 20, 50, 100];
        const limit = validLimits.includes(newLimit) ? newLimit : 10;

        // Solo recargar si realmente cambió
        if (limit === pagination.limit) return;

        // Resetear a página 1 y aplicar nuevo límite
        pagination.limit = limit;
        pagination.page = 1;
        await loadProjects();
    };

    // --------------- submit ---------------

    const onSubmit = handleSubmit(async (values) => {
        await submit({
            payload: () => ({
                name: values.name,
                status: values.status as ProjectApiStatus,
            }),
            onCreate: (payload) => svc.create(payload),
            onUpdate: (id, payload) => svc.update(id, payload),
            editingId,
            modalMode,
            saving,
            formError,
            successMessage: {
                create: 'Proyecto creado correctamente.',
                update: 'Proyecto actualizado correctamente.',
            },
            onSuccess: async () => {
                closeModal(true);
                await loadProjects();
            },
        });
    });

    onMounted(() => {
        loadProjects();
    });

    return {
        // list
        loading,
        error,
        projects,
        pagination,
        totalPages,
        changePage,
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
        errors,
        // actions
        openCreate,
        openEdit,
        closeModal,
        onSubmit,
        changeLimit,
        loadAll,
    };
};
