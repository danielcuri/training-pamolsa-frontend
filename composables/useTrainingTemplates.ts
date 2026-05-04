import { computed, onMounted, reactive, ref, watch } from 'vue';
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';

import { areaService } from '~/services/areaService';
import { trainingTemplateService } from '~/services/trainingTemplateService';
import { trainingTemplateSchema } from '~/schemas/trainingTemplate.schema';
import { useAlert } from './useAlert';
import { useFormSubmit } from './useFormSubmit';

import type { AreaMinimal } from '~/types/operation';
import type {
    TrainingTemplateItem,
    TrainingTemplateListParams,
    TrainingTemplateStatus,
    TrainingTemplateUpsertPayload,
} from '~/types/trainingTemplate';

export const useTrainingTemplates = () => {
    const { apiFetch } = useApiFetch();
    const svc = trainingTemplateService(apiFetch);
    const areaSvc = areaService(apiFetch);
    const { submit } = useFormSubmit();
    const { successAlert, errorAlert, confirmAlert } = useAlert();

    const loading = ref(false);
    const error = ref<string | null>(null);
    const templates = ref<TrainingTemplateItem[]>([]);

    const filters = reactive({
        projectId: '' as string | undefined,
        areaId: '' as string | undefined,
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
    const saving = ref(false);
    const formError = ref<string | null>(null);
    const editingId = ref<string | null>(null);

    const selectedProjectId = ref('');
    const availableAreas = ref<AreaMinimal[]>([]);
    const loadingAreas = ref(false);

    const filterAreas = ref<AreaMinimal[]>([]);
    const loadingFilterAreas = ref(false);

    const { handleSubmit, resetForm, setValues, errors, defineField } = useForm({
        validationSchema: toTypedSchema(trainingTemplateSchema),
        initialValues: {
            name: '',
            version: '1',
            periodDurationDays: '1',
            totalPeriods: '1',
            minimumPassingScore: '0',
            certificateTemplatePdf: '',
            status: 'ACTIVE' as TrainingTemplateStatus,
            projectId: '',
            areaId: '',
        },
    });

    const [name, nameAttrs] = defineField('name');
    const [version, versionAttrs] = defineField('version');
    const [periodDurationDays, periodDurationDaysAttrs] = defineField('periodDurationDays');
    const [totalPeriods, totalPeriodsAttrs] = defineField('totalPeriods');
    const [minimumPassingScore, minimumPassingScoreAttrs] = defineField('minimumPassingScore');
    const [certificateTemplatePdf, certificateTemplatePdfAttrs] = defineField('certificateTemplatePdf');
    const [status, statusAttrs] = defineField('status');
    const [projectId, projectIdAttrs] = defineField('projectId');
    const [areaId, areaIdAttrs] = defineField('areaId');

    const normalizeStatus = (rawStatus: unknown): TrainingTemplateStatus => {
        if (rawStatus === 'INACTIVE') return 'INACTIVE';
        return 'ACTIVE';
    };

    const normalizeTemplate = (raw: any, index: number, page: number, limit: number): TrainingTemplateItem | null => {
        const id = raw?.id ?? raw?._id ?? raw?.uuid ?? raw?.trainingTemplateId;
        const rawArea = raw?.area;
        const rawProject = raw?.project ?? rawArea?.project;

        if (id == null || raw?.name == null) return null;

        const normalizedProjectId = raw?.projectId ?? rawProject?.id ?? rawArea?.projectId;
        const normalizedAreaId = raw?.areaId ?? rawArea?.id;

        if (!normalizedProjectId || !normalizedAreaId) return null;

        return {
            id: String(id),
            name: String(raw.name),
            version: Number(raw?.version ?? 0),
            periodDurationDays: Number(raw?.periodDurationDays ?? 0),
            totalPeriods: Number(raw?.totalPeriods ?? 0),
            minimumPassingScore: Number(raw?.minimumPassingScore ?? 0),
            certificateTemplatePdf: raw?.certificateTemplatePdf ? String(raw.certificateTemplatePdf) : null,
            status: normalizeStatus(raw?.status),
            areaId: String(normalizedAreaId),
            projectId: String(normalizedProjectId),
            project: rawProject
                ? {
                      id: String(rawProject.id),
                      name: String(rawProject.name),
                      status: rawProject.status ? String(rawProject.status) : undefined,
                  }
                : undefined,
            area: rawArea
                ? {
                      id: String(rawArea.id),
                      name: String(rawArea.name),
                      status: rawArea.status ? String(rawArea.status) : undefined,
                      projectId: rawArea.projectId ? String(rawArea.projectId) : undefined,
                      project: rawArea.project
                          ? {
                                id: String(rawArea.project.id),
                                name: String(rawArea.project.name),
                                status: rawArea.project.status ? String(rawArea.project.status) : undefined,
                            }
                          : undefined,
                  }
                : undefined,
            createdAt: raw?.createdAt ? String(raw.createdAt) : undefined,
            updatedAt: raw?.updatedAt ? String(raw.updatedAt) : undefined,
            deletedAt: raw?.deletedAt ? String(raw.deletedAt) : null,
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

        const items = Array.isArray(itemsRaw)
            ? itemsRaw.map((raw: any, index: number) => normalizeTemplate(raw, index, page, limit)).filter(Boolean)
            : [];

        return { items, page, limit, total };
    };

    const buildListParams = (): TrainingTemplateListParams => {
        const params: TrainingTemplateListParams = {
            page: pagination.page,
            limit: pagination.limit,
            sortBy: 'createdAt',
            order: 'desc',
        };

        if (filters.projectId) params.projectId = filters.projectId;
        if (filters.areaId) params.areaId = filters.areaId;
        if (filters.search) params.search = filters.search;

        return params;
    };

    const loadAreaOptions = async (currentProjectId: string, target: 'form' | 'filter') => {
        const targetAreas = target === 'form' ? availableAreas : filterAreas;
        const targetLoading = target === 'form' ? loadingAreas : loadingFilterAreas;

        if (!currentProjectId) {
            targetAreas.value = [];
            return;
        }

        targetLoading.value = true;
        try {
            const aggregatedAreas: AreaMinimal[] = [];
            let currentPage = 1;
            let totalPagesToFetch = 1;

            while (currentPage <= totalPagesToFetch) {
                const res = await areaSvc.list({
                    projectId: currentProjectId,
                    page: currentPage,
                    limit: 100,
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
                            : aggregatedAreas.length + (Array.isArray(itemsRaw) ? itemsRaw.length : 0);

                if (Array.isArray(itemsRaw)) {
                    aggregatedAreas.push(
                        ...itemsRaw
                            .filter((raw: any) => raw?.status === 'ACTIVE')
                            .map((raw: any) => ({
                                id: String(raw?.id),
                                name: String(raw?.name),
                                status: raw?.status,
                            })),
                    );
                }

                totalPagesToFetch = Math.max(1, Math.ceil(total / Math.max(limit, 1)));
                currentPage = page + 1;
            }

            targetAreas.value = aggregatedAreas;
        } catch {
            targetAreas.value = [];
        } finally {
            targetLoading.value = false;
        }
    };

    watch(selectedProjectId, async (newProjectId) => {
        projectId.value = newProjectId;
        await loadAreaOptions(newProjectId, 'form');

        if (areaId.value && !availableAreas.value.find((area) => area.id === areaId.value)) {
            areaId.value = '';
        }
    });

    watch(
        () => filters.projectId,
        async (newProjectId) => {
            if (!newProjectId) {
                filterAreas.value = [];
                filters.areaId = '';
                return;
            }

            await loadAreaOptions(newProjectId, 'filter');

            if (filters.areaId && !filterAreas.value.find((area) => area.id === filters.areaId)) {
                filters.areaId = '';
            }
        },
    );

    const openCreate = () => {
        modalMode.value = 'create';
        editingId.value = null;
        formError.value = null;
        selectedProjectId.value = '';
        availableAreas.value = [];
        resetForm();
        isModalOpen.value = true;
    };

    const openEdit = async (template: TrainingTemplateItem) => {
        modalMode.value = 'edit';
        editingId.value = template.id;
        formError.value = null;
        resetForm();

        selectedProjectId.value = template.projectId;
        await loadAreaOptions(template.projectId, 'form');

        setValues({
            name: template.name,
            version: String(template.version),
            periodDurationDays: String(template.periodDurationDays),
            totalPeriods: String(template.totalPeriods),
            minimumPassingScore: String(template.minimumPassingScore),
            certificateTemplatePdf: template.certificateTemplatePdf ?? '',
            status: template.status,
            projectId: template.projectId,
            areaId: template.areaId,
        });

        isModalOpen.value = true;
    };

    const closeModal = (force = false) => {
        if (saving.value && !force) return;
        isModalOpen.value = false;
        editingId.value = null;
        formError.value = null;
        selectedProjectId.value = '';
        availableAreas.value = [];
        resetForm();
    };

    const loadTrainingTemplates = async () => {
        loading.value = true;
        error.value = null;

        try {
            const res = await svc.list(buildListParams());

            if (res.status && res.data) {
                const extracted = extractFromResponse(res);
                templates.value = extracted.items as TrainingTemplateItem[];
                pagination.page = extracted.page;
                pagination.limit = extracted.limit;
                pagination.total = extracted.total;
            } else {
                templates.value = [];
                pagination.total = 0;
            }
        } catch (e: any) {
            error.value = e?.data?.message ?? 'Error al cargar templates';
            templates.value = [];
            pagination.total = 0;
        } finally {
            loading.value = false;
        }
    };

    const changePage = async (newPage: number) => {
        const page = Math.max(1, Math.min(totalPages.value, newPage));
        if (page === pagination.page) return;
        pagination.page = page;
        await loadTrainingTemplates();
    };

    const changeLimit = async (newLimit: number) => {
        const validLimits = [10, 20, 50, 100];
        const limit = validLimits.includes(newLimit) ? newLimit : 10;

        if (limit === pagination.limit) return;

        pagination.limit = limit;
        pagination.page = 1;
        await loadTrainingTemplates();
    };

    const setFilter = (key: keyof typeof filters, value: string) => {
        filters[key] = value as any;
        pagination.page = 1;
    };

    const handleDelete = async (template: TrainingTemplateItem) => {
        const confirmed = await confirmAlert(`¿Eliminar el template "${template.name}"?`);
        if (!confirmed) return;

        try {
            await svc.remove(template.id);
            await successAlert('Template eliminado correctamente.');
            await loadTrainingTemplates();
        } catch (e: any) {
            await errorAlert(e?.data?.message ?? 'Error al eliminar el template.');
        }
    };

    const buildPayload = (values: Record<string, any>): TrainingTemplateUpsertPayload => ({
        name: String(values.name).trim(),
        version: Number(values.version),
        periodDurationDays: Number(values.periodDurationDays),
        totalPeriods: Number(values.totalPeriods),
        minimumPassingScore: Number(values.minimumPassingScore),
        certificateTemplatePdf: values.certificateTemplatePdf ? String(values.certificateTemplatePdf).trim() : '',
        status: values.status as TrainingTemplateStatus,
        projectId: String(values.projectId),
        areaId: String(values.areaId),
    });

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
                create: 'Template creado correctamente.',
                update: 'Template actualizado correctamente.',
            },
            onSuccess: async () => {
                closeModal(true);
                await loadTrainingTemplates();
            },
        });
    });

    onMounted(() => {
        loadTrainingTemplates();
    });

    return {
        loading,
        error,
        templates,
        pagination,
        totalPages,
        filters,
        filterAreas,
        loadingFilterAreas,
        selectedProjectId,
        availableAreas,
        loadingAreas,
        isModalOpen,
        modalMode,
        saving,
        formError,
        name,
        nameAttrs,
        version,
        versionAttrs,
        periodDurationDays,
        periodDurationDaysAttrs,
        totalPeriods,
        totalPeriodsAttrs,
        minimumPassingScore,
        minimumPassingScoreAttrs,
        certificateTemplatePdf,
        certificateTemplatePdfAttrs,
        status,
        statusAttrs,
        projectId,
        projectIdAttrs,
        areaId,
        areaIdAttrs,
        errors,
        loadTrainingTemplates,
        changePage,
        changeLimit,
        setFilter,
        loadAreaOptions,
        openCreate,
        openEdit,
        closeModal,
        handleDelete,
        onSubmit,
    };
};
