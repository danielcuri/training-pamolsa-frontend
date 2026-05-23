import { computed, onMounted, reactive, ref, watch } from 'vue';
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { areaService } from '~/services/areaService';
import { projectService } from '~/services/projectService';
import { trainingSchema } from '~/schemas/training.schema';
import { trainingService } from '~/services/trainingService';
import { trainingTemplateService } from '~/services/trainingTemplateService';
import { userService } from '~/services/userService';
import { useFormSubmit } from './useFormSubmit';
import type { AreaMinimal } from '~/types/operation';
import type { Project } from '~/types/project';
import type {
    TrainingItem,
    TrainingListParams,
    TrainingResult,
    TrainingStatus,
    TrainingTemplateOption,
    TrainingUpsertPayload,
    TrainingUserOption,
} from '~/types/training';

const toIsoDateTime = (value: string) => new Date(`${value}T00:00:00`).toISOString();
const toDateInput = (value?: string | null) => (value ? value.slice(0, 10) : '');

export const useTrainings = () => {
    const { apiFetch } = useApiFetch();
    const svc = trainingService(apiFetch);
    const areaSvc = areaService(apiFetch);
    const projectSvc = projectService(apiFetch);
    const templateSvc = trainingTemplateService(apiFetch);
    const userSvc = userService(apiFetch);
    const { submit } = useFormSubmit();
    const { successAlert, errorAlert, confirmAlert } = useAlert();

    const loading = ref(false);
    const loadingOptions = ref(false);
    const saving = ref(false);
    const error = ref<string | null>(null);
    const formError = ref<string | null>(null);
    const trainings = ref<TrainingItem[]>([]);
    const users = ref<TrainingUserOption[]>([]);
    const templates = ref<TrainingTemplateOption[]>([]);
    const formUsers = ref<TrainingUserOption[]>([]);
    const formTemplates = ref<TrainingTemplateOption[]>([]);
    const projects = ref<Project[]>([]);
    const availableAreas = ref<AreaMinimal[]>([]);
    const loadingAreas = ref(false);
    const selectedProjectId = ref('');
    const selectedAreaId = ref('');
    const hydratingEditForm = ref(false);

    const filters = reactive({
        userId: '' as string | undefined,
        templateId: '' as string | undefined,
        status: '' as TrainingStatus | '',
        result: '' as TrainingResult | '',
        search: '',
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

    const isModalOpen = ref(false);
    const modalMode = ref<'create' | 'edit'>('create');
    const editingId = ref<string | null>(null);

    const statusOptions: Array<{ label: string; value: TrainingStatus }> = [
        { label: 'No iniciado', value: 'NOT_STARTED' },
        { label: 'En progreso', value: 'IN_PROGRESS' },
        { label: 'Completado', value: 'COMPLETED' },
    ];

    const resultOptions: Array<{ label: string; value: TrainingResult }> = [
        { label: 'Aprobado', value: 'PASSED' },
        { label: 'Desaprobado', value: 'FAILED' },
    ];

    const { handleSubmit, resetForm, setValues, errors, defineField } = useForm({
        validationSchema: toTypedSchema(trainingSchema),
        initialValues: {
            userId: '',
            templateId: '',
            startDate: '',
            status: 'NOT_STARTED' as TrainingStatus,
            result: 'PASSED' as TrainingResult,
        },
    });

    const [userId, userIdAttrs] = defineField('userId');
    const [templateId, templateIdAttrs] = defineField('templateId');
    const [startDate, startDateAttrs] = defineField('startDate');
    const [status, statusAttrs] = defineField('status');
    const [result, resultAttrs] = defineField('result');

    const normalizeTraining = (raw: any, index: number, page: number, limit: number): TrainingItem | null => {
        const id = raw?.id ?? raw?._id ?? raw?.uuid ?? raw?.trainingId;
        const normalizedUserId = raw?.userId ?? raw?.user?.id;
        const normalizedTemplateId = raw?.templateId ?? raw?.template?.id;
        const normalizedProjectId = raw?.projectId ?? raw?.project?.id ?? raw?.area?.projectId ?? raw?.template?.projectId ?? raw?.template?.project?.id;
        const normalizedAreaId = raw?.areaId ?? raw?.area?.id ?? raw?.template?.areaId ?? raw?.template?.area?.id ?? raw?.user?.areaId ?? raw?.user?.area?.id;

        if (!id || !normalizedUserId || !normalizedTemplateId || !raw?.startDate || !raw?.status || !raw?.result) {
            return null;
        }

        return {
            id: String(id),
            userId: String(normalizedUserId),
            templateId: String(normalizedTemplateId),
            projectId: normalizedProjectId ? String(normalizedProjectId) : null,
            areaId: normalizedAreaId ? String(normalizedAreaId) : null,
            startDate: String(raw.startDate),
            status: raw.status as TrainingStatus,
            result: raw.result as TrainingResult,
            user: raw?.user
                ? {
                      id: String(raw.user.id),
                      name: String(raw.user.name),
                      email: raw.user.email ? String(raw.user.email) : null,
                  }
                : undefined,
            template: raw?.template
                ? {
                      id: String(raw.template.id),
                      name: String(raw.template.name),
                      version: typeof raw?.template?.version === 'number' ? raw.template.version : Number(raw?.template?.version ?? 0),
                  }
                : undefined,
            createdAt: raw?.createdAt ? String(raw.createdAt) : undefined,
            updatedAt: raw?.updatedAt ? String(raw.updatedAt) : undefined,
            rowIndex: (page - 1) * limit + index + 1,
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

        const items = Array.isArray(itemsRaw) ? itemsRaw.map((raw: any, index: number) => normalizeTraining(raw, index, page, limit)).filter(Boolean) : [];
        return { items, page, limit, total };
    };

    const buildListParams = (): TrainingListParams => {
        const params: TrainingListParams = {
            page: pagination.page,
            limit: pagination.limit,
            sortBy: 'createdAt',
            order: 'desc',
        };

        if (filters.userId) params.userId = filters.userId;
        if (filters.templateId) params.templateId = filters.templateId;
        if (filters.status) params.status = filters.status;
        if (filters.result) params.result = filters.result;
        if (filters.search) params.search = filters.search;

        return params;
    };

    const loadUsers = async () => {
        const aggregatedUsers: TrainingUserOption[] = [];
        let currentPage = 1;
        let totalPagesToFetch = 1;

        while (currentPage <= totalPagesToFetch) {
            const res = await userSvc.list({
                page: currentPage,
                limit: 100,
                sortBy: 'createdAt',
                order: 'desc',
                status: 'ACTIVE',
            });
            const apiData: any = res?.data;
            const meta: any = res?.meta ?? apiData?.meta ?? {};
            const itemsRaw = Array.isArray(apiData) ? apiData : (apiData?.items ?? apiData?.list ?? apiData?.data ?? []);
            const page = typeof meta?.page === 'number' ? meta.page : typeof apiData?.page === 'number' ? apiData.page : currentPage;
            const limit = typeof meta?.limit === 'number' ? meta.limit : typeof apiData?.limit === 'number' ? apiData.limit : 100;
            const total =
                typeof meta?.total === 'number'
                    ? meta.total
                    : typeof meta?.totalItems === 'number'
                      ? meta.totalItems
                      : typeof apiData?.total === 'number'
                        ? apiData.total
                        : aggregatedUsers.length + (Array.isArray(itemsRaw) ? itemsRaw.length : 0);

            if (Array.isArray(itemsRaw)) {
                aggregatedUsers.push(
                    ...itemsRaw
                        .filter((raw: any) => raw?.id && raw?.name)
                        .map((raw: any) => ({
                            id: String(raw.id),
                            name: String(raw.name),
                            email: raw?.email ? String(raw.email) : null,
                            projectId: raw?.projectId ? String(raw.projectId) : raw?.project?.id ? String(raw.project.id) : raw?.area?.projectId ? String(raw.area.projectId) : null,
                            areaId: raw?.areaId ? String(raw.areaId) : raw?.area?.id ? String(raw.area.id) : null,
                        })),
                );
            }

            totalPagesToFetch = Math.max(1, Math.ceil(total / Math.max(limit, 1)));
            currentPage = page + 1;
        }

        users.value = aggregatedUsers;
    };

    const loadTemplates = async () => {
        const aggregatedTemplates: TrainingTemplateOption[] = [];
        let currentPage = 1;
        let totalPagesToFetch = 1;

        while (currentPage <= totalPagesToFetch) {
            const res = await templateSvc.list({ page: currentPage, limit: 100, sortBy: 'createdAt', order: 'desc' });
            const apiData: any = res?.data;
            const meta: any = res?.meta ?? apiData?.meta ?? {};
            const itemsRaw = Array.isArray(apiData) ? apiData : (apiData?.items ?? apiData?.list ?? apiData?.data ?? []);
            const page = typeof meta?.page === 'number' ? meta.page : typeof apiData?.page === 'number' ? apiData.page : currentPage;
            const limit = typeof meta?.limit === 'number' ? meta.limit : typeof apiData?.limit === 'number' ? apiData.limit : 100;
            const total =
                typeof meta?.total === 'number'
                    ? meta.total
                    : typeof meta?.totalItems === 'number'
                      ? meta.totalItems
                      : typeof apiData?.total === 'number'
                        ? apiData.total
                        : aggregatedTemplates.length + (Array.isArray(itemsRaw) ? itemsRaw.length : 0);

            if (Array.isArray(itemsRaw)) {
                aggregatedTemplates.push(
                    ...itemsRaw
                        .filter((raw: any) => raw?.id && raw?.name && raw?.status === 'ACTIVE')
                        .map((raw: any) => ({
                            id: String(raw.id),
                            name: String(raw.name),
                            version: typeof raw?.version === 'number' ? raw.version : Number(raw?.version ?? 0),
                            projectId: String(raw?.projectId ?? raw?.project?.id ?? raw?.area?.projectId ?? ''),
                            areaId: String(raw?.areaId ?? raw?.area?.id ?? ''),
                        })),
                );
            }

            totalPagesToFetch = Math.max(1, Math.ceil(total / Math.max(limit, 1)));
            currentPage = page + 1;
        }

        templates.value = aggregatedTemplates;
    };

    const loadFormUsers = async (projectId: string, areaId: string) => {
        if (!projectId || !areaId) {
            formUsers.value = [];
            return;
        }

        const aggregatedUsers: TrainingUserOption[] = [];
        let currentPage = 1;
        let totalPagesToFetch = 1;

        while (currentPage <= totalPagesToFetch) {
            const res = await userSvc.list({
                projectId,
                areaId,
                page: currentPage,
                limit: 100,
                sortBy: 'createdAt',
                order: 'desc',
                status: 'ACTIVE',
            });
            const apiData: any = res?.data;
            const meta: any = res?.meta ?? apiData?.meta ?? {};
            const itemsRaw = Array.isArray(apiData) ? apiData : (apiData?.items ?? apiData?.list ?? apiData?.data ?? []);
            const page = typeof meta?.page === 'number' ? meta.page : typeof apiData?.page === 'number' ? apiData.page : currentPage;
            const limit = typeof meta?.limit === 'number' ? meta.limit : typeof apiData?.limit === 'number' ? apiData.limit : 100;
            const total =
                typeof meta?.total === 'number'
                    ? meta.total
                    : typeof meta?.totalItems === 'number'
                      ? meta.totalItems
                      : typeof apiData?.total === 'number'
                        ? apiData.total
                        : aggregatedUsers.length + (Array.isArray(itemsRaw) ? itemsRaw.length : 0);

            if (Array.isArray(itemsRaw)) {
                aggregatedUsers.push(
                    ...itemsRaw
                        .filter((raw: any) => raw?.id && raw?.name)
                        .map((raw: any) => ({
                            id: String(raw.id),
                            name: String(raw.name),
                            email: raw?.email ? String(raw.email) : null,
                            projectId: raw?.projectId ? String(raw.projectId) : raw?.project?.id ? String(raw.project.id) : raw?.area?.projectId ? String(raw.area.projectId) : null,
                            areaId: raw?.areaId ? String(raw.areaId) : raw?.area?.id ? String(raw.area.id) : null,
                        })),
                );
            }

            totalPagesToFetch = Math.max(1, Math.ceil(total / Math.max(limit, 1)));
            currentPage = page + 1;
        }

        formUsers.value = aggregatedUsers;
    };

    const loadFormTemplates = async (projectId: string, areaId: string) => {
        if (!projectId || !areaId) {
            formTemplates.value = [];
            return;
        }

        const aggregatedTemplates: TrainingTemplateOption[] = [];
        let currentPage = 1;
        let totalPagesToFetch = 1;

        while (currentPage <= totalPagesToFetch) {
            const res = await templateSvc.list({
                projectId,
                areaId,
                page: currentPage,
                limit: 100,
                sortBy: 'createdAt',
                order: 'desc',
            });
            const apiData: any = res?.data;
            const meta: any = res?.meta ?? apiData?.meta ?? {};
            const itemsRaw = Array.isArray(apiData) ? apiData : (apiData?.items ?? apiData?.list ?? apiData?.data ?? []);
            const page = typeof meta?.page === 'number' ? meta.page : typeof apiData?.page === 'number' ? apiData.page : currentPage;
            const limit = typeof meta?.limit === 'number' ? meta.limit : typeof apiData?.limit === 'number' ? apiData.limit : 100;
            const total =
                typeof meta?.total === 'number'
                    ? meta.total
                    : typeof meta?.totalItems === 'number'
                      ? meta.totalItems
                      : typeof apiData?.total === 'number'
                        ? apiData.total
                        : aggregatedTemplates.length + (Array.isArray(itemsRaw) ? itemsRaw.length : 0);

            if (Array.isArray(itemsRaw)) {
                aggregatedTemplates.push(
                    ...itemsRaw
                        .filter((raw: any) => raw?.id && raw?.name && raw?.status === 'ACTIVE')
                        .map((raw: any) => ({
                            id: String(raw.id),
                            name: String(raw.name),
                            version: typeof raw?.version === 'number' ? raw.version : Number(raw?.version ?? 0),
                            projectId: String(raw?.projectId ?? raw?.project?.id ?? raw?.area?.projectId ?? ''),
                            areaId: String(raw?.areaId ?? raw?.area?.id ?? ''),
                        })),
                );
            }

            totalPagesToFetch = Math.max(1, Math.ceil(total / Math.max(limit, 1)));
            currentPage = page + 1;
        }

        formTemplates.value = aggregatedTemplates;
    };

    const loadProjects = async () => {
        const aggregatedProjects: Project[] = [];
        let currentPage = 1;
        let totalPagesToFetch = 1;

        while (currentPage <= totalPagesToFetch) {
            const res = await projectSvc.list({ page: currentPage, limit: 100, sortBy: 'createdAt', order: 'desc' });
            const apiData: any = res?.data;
            const meta: any = res?.meta ?? apiData?.meta ?? {};
            const itemsRaw = Array.isArray(apiData) ? apiData : (apiData?.items ?? apiData?.list ?? apiData?.data ?? []);
            const page = typeof meta?.page === 'number' ? meta.page : typeof apiData?.page === 'number' ? apiData.page : currentPage;
            const limit = typeof meta?.limit === 'number' ? meta.limit : typeof apiData?.limit === 'number' ? apiData.limit : 100;
            const total =
                typeof meta?.total === 'number'
                    ? meta.total
                    : typeof meta?.totalItems === 'number'
                      ? meta.totalItems
                      : typeof apiData?.total === 'number'
                        ? apiData.total
                        : aggregatedProjects.length + (Array.isArray(itemsRaw) ? itemsRaw.length : 0);

            if (Array.isArray(itemsRaw)) {
                aggregatedProjects.push(
                    ...itemsRaw
                        .filter((raw: any) => raw?.id && raw?.name && raw?.status === 'ACTIVE')
                        .map((raw: any) => ({
                            id: String(raw.id),
                            name: String(raw.name),
                            status: raw.status,
                            createdAt: raw?.createdAt ? String(raw.createdAt) : undefined,
                            updatedAt: raw?.updatedAt ? String(raw.updatedAt) : undefined,
                            deletedAt: raw?.deletedAt ? String(raw.deletedAt) : null,
                        })),
                );
            }

            totalPagesToFetch = Math.max(1, Math.ceil(total / Math.max(limit, 1)));
            currentPage = page + 1;
        }

        projects.value = aggregatedProjects;
    };

    const loadAreas = async (projectId: string) => {
        if (!projectId) {
            availableAreas.value = [];
            return;
        }

        loadingAreas.value = true;
        try {
            const aggregatedAreas: AreaMinimal[] = [];
            let currentPage = 1;
            let totalPagesToFetch = 1;

            while (currentPage <= totalPagesToFetch) {
                const res = await areaSvc.list({ projectId, page: currentPage, limit: 100 });
                const apiData: any = res?.data;
                const meta: any = res?.meta ?? apiData?.meta ?? {};
                const itemsRaw = Array.isArray(apiData) ? apiData : (apiData?.items ?? apiData?.list ?? apiData?.data ?? []);
                const page = typeof meta?.page === 'number' ? meta.page : typeof apiData?.page === 'number' ? apiData.page : currentPage;
                const limit = typeof meta?.limit === 'number' ? meta.limit : typeof apiData?.limit === 'number' ? apiData.limit : 100;
                const total =
                    typeof meta?.total === 'number'
                        ? meta.total
                        : typeof meta?.totalItems === 'number'
                          ? meta.totalItems
                          : typeof apiData?.total === 'number'
                            ? apiData.total
                            : aggregatedAreas.length + (Array.isArray(itemsRaw) ? itemsRaw.length : 0);

                if (Array.isArray(itemsRaw)) {
                    aggregatedAreas.push(
                        ...itemsRaw
                            .filter((raw: any) => raw?.id && raw?.name && raw?.status === 'ACTIVE')
                            .map((raw: any) => ({
                                id: String(raw.id),
                                name: String(raw.name),
                                status: raw.status,
                            })),
                    );
                }

                totalPagesToFetch = Math.max(1, Math.ceil(total / Math.max(limit, 1)));
                currentPage = page + 1;
            }

            availableAreas.value = aggregatedAreas;
        } catch {
            availableAreas.value = [];
        } finally {
            loadingAreas.value = false;
        }
    };

    const loadOptions = async () => {
        loadingOptions.value = true;
        try {
            await Promise.all([loadUsers(), loadTemplates(), loadProjects()]);
        } catch (e: any) {
            await errorAlert(e?.data?.message ?? 'Error al cargar opciones de training.');
        } finally {
            loadingOptions.value = false;
        }
    };

    const loadTrainings = async () => {
        loading.value = true;
        error.value = null;

        try {
            const res = await svc.list(buildListParams());
            if (res.status && res.data) {
                const extracted = extractFromResponse(res);
                trainings.value = extracted.items as TrainingItem[];
                pagination.page = extracted.page;
                pagination.limit = extracted.limit;
                pagination.total = extracted.total;
            } else {
                trainings.value = [];
                pagination.total = 0;
            }
        } catch (e: any) {
            error.value = e?.data?.message ?? 'Error al cargar trainings';
            trainings.value = [];
            pagination.total = 0;
        } finally {
            loading.value = false;
        }
    };

    const openCreate = () => {
        modalMode.value = 'create';
        editingId.value = null;
        formError.value = null;
        selectedProjectId.value = '';
        selectedAreaId.value = '';
        availableAreas.value = [];
        formUsers.value = [];
        formTemplates.value = [];
        resetForm({
            values: {
                userId: '',
                templateId: '',
                startDate: '',
                status: 'NOT_STARTED',
                result: 'PASSED',
            },
        });
        isModalOpen.value = true;
    };

    const openEdit = async (training: TrainingItem) => {
        modalMode.value = 'edit';
        editingId.value = training.id;
        formError.value = null;
        hydratingEditForm.value = true;

        try {
            resetForm();

            const matchedUser = users.value.find((user) => user.id === training.userId);
            const matchedTemplate = templates.value.find((template) => template.id === training.templateId);
            const resolvedProjectId = training.projectId ?? matchedTemplate?.projectId ?? matchedUser?.projectId ?? '';
            const resolvedAreaId = training.areaId ?? matchedTemplate?.areaId ?? matchedUser?.areaId ?? '';

            selectedProjectId.value = resolvedProjectId;

            if (resolvedProjectId) {
                await loadAreas(resolvedProjectId);
            } else {
                availableAreas.value = [];
            }

            selectedAreaId.value = resolvedAreaId;

            if (resolvedProjectId && resolvedAreaId) {
                await Promise.all([loadFormUsers(resolvedProjectId, resolvedAreaId), loadFormTemplates(resolvedProjectId, resolvedAreaId)]);
            } else {
                formUsers.value = [];
                formTemplates.value = [];
            }

            setValues({
                userId: training.userId,
                templateId: training.templateId,
                startDate: toDateInput(training.startDate),
                status: training.status,
                result: training.result,
            });

            isModalOpen.value = true;
        } finally {
            hydratingEditForm.value = false;
        }
    };

    const closeModal = (force = false) => {
        if (saving.value && !force) return;
        isModalOpen.value = false;
        editingId.value = null;
        formError.value = null;
        selectedProjectId.value = '';
        selectedAreaId.value = '';
        availableAreas.value = [];
        formUsers.value = [];
        formTemplates.value = [];
        resetForm();
    };

    const changePage = async (newPage: number) => {
        const page = Math.max(1, Math.min(totalPages.value, newPage));
        if (page === pagination.page) return;
        pagination.page = page;
        await loadTrainings();
    };

    const changeLimit = async (newLimit: number) => {
        const validLimits = [10, 20, 50, 100];
        const limit = validLimits.includes(newLimit) ? newLimit : 10;
        if (limit === pagination.limit) return;
        pagination.limit = limit;
        pagination.page = 1;
        await loadTrainings();
    };

    const setFilter = (key: keyof typeof filters, value: string) => {
        filters[key] = value as any;
        pagination.page = 1;
    };

    const buildPayload = (values: Record<string, any>): TrainingUpsertPayload => ({
        userId: String(values.userId),
        templateId: String(values.templateId),
        startDate: toIsoDateTime(String(values.startDate)),
        status: values.status as TrainingStatus,
        result: values.result as TrainingResult,
    });

    const handleDelete = async (training: TrainingItem) => {
        const trainingName = training.template?.name ?? training.templateId;
        const confirmed = await confirmAlert(`¿Eliminar el training "${trainingName}"?`);
        if (!confirmed) return;

        try {
            await svc.remove(training.id);
            await successAlert('Training eliminado correctamente.');
            await loadTrainings();
        } catch (e: any) {
            await errorAlert(e?.data?.message ?? 'Error al eliminar training.');
        }
    };

    const onSubmit = handleSubmit(async (values) => {
        await submit({
            payload: () => buildPayload(values),
            onCreate: (payload) => svc.create(payload),
            onUpdate: (id, payload) => svc.update(id, payload),
            editingId,
            modalMode,
            saving,
            formError,
            successMessage: {
                create: 'Training creado correctamente.',
                update: 'Training actualizado correctamente.',
            },
            onSuccess: async () => {
                closeModal(true);
                await loadTrainings();
            },
        });
    });

    watch(selectedProjectId, async (value) => {
        if (!hydratingEditForm.value) {
            selectedAreaId.value = '';
            userId.value = '';
            templateId.value = '';
            formUsers.value = [];
            formTemplates.value = [];
        }
        await loadAreas(value);
    });

    watch(selectedAreaId, async (value) => {
        if (!hydratingEditForm.value) {
            userId.value = '';
            templateId.value = '';
        }
        await Promise.all([loadFormUsers(selectedProjectId.value, value), loadFormTemplates(selectedProjectId.value, value)]);
    });

    onMounted(async () => {
        await Promise.all([loadOptions(), loadTrainings()]);
    });

    return {
        loading,
        loadingOptions,
        saving,
        error,
        formError,
        trainings,
        users,
        templates,
        formUsers,
        formTemplates,
        projects,
        availableAreas,
        loadingAreas,
        selectedProjectId,
        selectedAreaId,
        pagination,
        filters,
        isModalOpen,
        modalMode,
        statusOptions,
        resultOptions,
        userId,
        userIdAttrs,
        templateId,
        templateIdAttrs,
        startDate,
        startDateAttrs,
        status,
        statusAttrs,
        result,
        resultAttrs,
        errors,
        openCreate,
        openEdit,
        closeModal,
        handleDelete,
        loadTrainings,
        changePage,
        changeLimit,
        setFilter,
        onSubmit,
    };
};
