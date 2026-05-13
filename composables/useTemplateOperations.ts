import { computed, onMounted, reactive, ref } from 'vue';
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';

import { operationService } from '~/services/operationService';
import { templateOperationService } from '~/services/templateOperationService';
import { trainingTemplateService } from '~/services/trainingTemplateService';
import { templateOperationSchema } from '~/schemas/templateOperation.schema';
import { useAlert } from './useAlert';
import { useFormSubmit } from './useFormSubmit';

import { OperationPriority } from '~/types/operation';
import type { AreaWithProject, Operation } from '~/types/operation';
import type { TrainingTemplateItem } from '~/types/trainingTemplate';
import type { TemplateOperation, TemplateOperationListParams, TemplateOperationUpsertPayload } from '~/types/templateOperation';

export const useTemplateOperations = (templateId: string) => {
    const { apiFetch } = useApiFetch();
    const svc = templateOperationService(apiFetch);
    const operationSvc = operationService(apiFetch);
    const templateSvc = trainingTemplateService(apiFetch);
    const { submit } = useFormSubmit();
    const { successAlert, errorAlert, confirmAlert } = useAlert();

    const loading = ref(false);
    const error = ref<string | null>(null);
    const operations = ref<TemplateOperation[]>([]);
    const template = ref<TrainingTemplateItem | null>(null);

    const filters = reactive({
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

    const operationOptions = ref<Operation[]>([]);
    const loadingOperationOptions = ref(false);

    const { handleSubmit, resetForm, setValues, errors, defineField } = useForm({
        validationSchema: toTypedSchema(templateOperationSchema),
        initialValues: {
            name: '',
            code: '',
            description: '',
            priority: 'CRITICAL' as OperationPriority,
            weightPercent: 0,
            order: 0,
            areaOperationId: '',
        },
    });

    const [name, nameAttrs] = defineField('name');
    const [code, codeAttrs] = defineField('code');
    const [description, descriptionAttrs] = defineField('description');
    const [priority, priorityAttrs] = defineField('priority');
    const [weightPercent, weightPercentAttrs] = defineField('weightPercent');
    const [order, orderAttrs] = defineField('order');
    const [areaOperationId, areaOperationIdAttrs] = defineField('areaOperationId');

    const normalizePriority = (raw: unknown): OperationPriority => {
        if (raw === OperationPriority.SEMI_CRITICAL) return OperationPriority.SEMI_CRITICAL;
        if (raw === OperationPriority.NON_CRITICAL) return OperationPriority.NON_CRITICAL;
        return OperationPriority.CRITICAL;
    };

    const unwrapResponseData = (response: unknown): any => {
        const payload = response as { data?: unknown } | null | undefined;
        const firstLevel = payload?.data as { data?: unknown } | unknown;

        if (firstLevel && typeof firstLevel === 'object' && 'data' in (firstLevel as Record<string, unknown>)) {
            return (firstLevel as { data?: unknown }).data;
        }

        return firstLevel;
    };

    const normalizeArea = (rawArea: any): AreaWithProject | undefined => {
        if (!rawArea?.id || !rawArea?.name) return undefined;

        return {
            id: String(rawArea.id),
            name: String(rawArea.name),
            status: rawArea.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
            projectId: String(rawArea.projectId ?? rawArea.project?.id ?? ''),
            project: rawArea.project?.id && rawArea.project?.name
                ? {
                      id: String(rawArea.project.id),
                      name: String(rawArea.project.name),
                  }
                : undefined,
        };
    };

    const normalizeOperation = (raw: any, index: number, page: number, limit: number): TemplateOperation | null => {
        const id = raw?.id ?? raw?._id ?? raw?.uuid ?? raw?.templateOperationId;
        const rawArea = raw?.areaOperation ?? raw?.area;

        if (id == null || raw?.name == null) return null;

        return {
            id: String(id),
            name: String(raw.name),
            code: raw?.code != null ? String(raw.code) : undefined,
            description: raw?.description ? String(raw.description) : null,
            priority: normalizePriority(raw?.priority),
            weightPercent: Number(raw?.weightPercent ?? 0),
            order: Number(raw?.order ?? 0),
            areaOperationId: String(raw?.areaOperationId ?? rawArea?.id ?? ''),
            areaOperation: normalizeArea(rawArea),
            createdAt: raw?.createdAt ? String(raw.createdAt) : undefined,
            updatedAt: raw?.updatedAt ? String(raw.updatedAt) : undefined,
            deletedAt: raw?.deletedAt ? String(raw.deletedAt) : null,
            rowIndex: (page - 1) * limit + index + 1,
        };
    };

    const normalizeSelectableOperation = (raw: any): Operation | null => {
        const id = raw?.id ?? raw?._id ?? raw?.uuid;
        const rawArea = raw?.area;

        if (id == null || raw?.name == null || raw?.priority == null) return null;

        return {
            id: String(id),
            name: String(raw.name),
            code: raw?.code != null ? String(raw.code) : undefined,
            description: raw?.description ? String(raw.description) : undefined,
            weightPercent: Number(raw?.weightPercent ?? 0),
            priority: normalizePriority(raw?.priority),
            status: raw?.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
            areaId: String(raw?.areaId ?? rawArea?.id ?? ''),
            area: normalizeArea(rawArea),
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
            ? itemsRaw.map((raw: any, index: number) => normalizeOperation(raw, index, page, limit)).filter(Boolean)
            : [];

        return { items, page, limit, total };
    };

    const buildListParams = (): TemplateOperationListParams => {
        const params: TemplateOperationListParams = {
            page: pagination.page,
            limit: pagination.limit,
            sortBy: 'createdAt',
            order: 'desc',
        };

        if (filters.search) params.search = filters.search;

        return params;
    };

    const loadTemplate = async () => {
        try {
            const res = await templateSvc.findOne(templateId);
            const raw = unwrapResponseData(res);

            if (!raw) return;

            template.value = {
                id: String(raw?.id ?? raw?._id ?? raw?.uuid ?? raw?.trainingTemplateId),
                name: String(raw?.name ?? ''),
                version: Number(raw?.version ?? 0),
                periodDurationDays: Number(raw?.periodDurationDays ?? 0),
                totalPeriods: Number(raw?.totalPeriods ?? 0),
                minimumPassingScore: Number(raw?.minimumPassingScore ?? 0),
                certificateTemplatePdf: raw?.certificateTemplatePdf ? String(raw.certificateTemplatePdf) : null,
                status: raw?.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
                areaId: String(raw?.areaId ?? raw?.area?.id ?? ''),
                projectId: String(raw?.projectId ?? raw?.project?.id ?? raw?.area?.projectId ?? raw?.area?.project?.id ?? ''),
                project: raw?.project?.id && raw?.project?.name
                    ? {
                          id: String(raw.project.id),
                          name: String(raw.project.name),
                          status: raw.project.status ? String(raw.project.status) : undefined,
                      }
                    : undefined,
                area: raw?.area?.id && raw?.area?.name
                    ? {
                          id: String(raw.area.id),
                          name: String(raw.area.name),
                          status: raw.area.status ? String(raw.area.status) : undefined,
                          projectId: raw.area.projectId ? String(raw.area.projectId) : undefined,
                          project: raw.area.project?.id && raw.area.project?.name
                              ? {
                                    id: String(raw.area.project.id),
                                    name: String(raw.area.project.name),
                                    status: raw.area.project.status ? String(raw.area.project.status) : undefined,
                                }
                              : undefined,
                      }
                    : undefined,
            };
        } catch {
            template.value = null;
        }
    };

    const loadOperationOptions = async () => {
        if (!template.value?.areaId) {
            operationOptions.value = [];
            return;
        }

        loadingOperationOptions.value = true;
        try {
            const aggregatedOperations: Operation[] = [];
            let currentPage = 1;
            let totalPagesToFetch = 1;

            while (currentPage <= totalPagesToFetch) {
                const res = await operationSvc.list({
                    areaId: template.value.areaId,
                    page: currentPage,
                    limit: 100,
                    sortBy: 'createdAt',
                    order: 'desc',
                });

                const apiData: any = res?.data;
                const meta: any = res?.meta ?? apiData?.meta ?? {};
                const itemsRaw = Array.isArray(apiData) ? apiData : (apiData?.items ?? apiData?.list ?? apiData?.data ?? apiData?.results ?? []);
                const page = typeof meta?.page === 'number' ? meta.page : typeof apiData?.page === 'number' ? apiData.page : currentPage;
                const limit = typeof meta?.limit === 'number' ? meta.limit : typeof apiData?.limit === 'number' ? apiData.limit : 100;
                const total =
                    typeof meta?.total === 'number'
                        ? meta.total
                        : typeof meta?.totalItems === 'number'
                          ? meta.totalItems
                          : typeof apiData?.total === 'number'
                            ? apiData.total
                            : aggregatedOperations.length + (Array.isArray(itemsRaw) ? itemsRaw.length : 0);

                if (Array.isArray(itemsRaw)) {
                    aggregatedOperations.push(
                        ...itemsRaw
                            .map((raw: any) => normalizeSelectableOperation(raw))
                            .filter((item): item is Operation => item !== null && item.status === 'ACTIVE'),
                    );
                }

                totalPagesToFetch = Math.max(1, Math.ceil(total / Math.max(limit, 1)));
                currentPage = page + 1;
            }

            operationOptions.value = aggregatedOperations;

            if (areaOperationId.value && !aggregatedOperations.find((operation) => operation.id === areaOperationId.value)) {
                areaOperationId.value = '';
            }
        } catch {
            operationOptions.value = [];
        } finally {
            loadingOperationOptions.value = false;
        }
    };

    const loadOperations = async () => {
        loading.value = true;
        error.value = null;

        try {
            const res = await svc.list(templateId, buildListParams());

            if (res.status && res.data) {
                const extracted = extractFromResponse(res);
                operations.value = extracted.items as TemplateOperation[];
                pagination.page = extracted.page;
                pagination.limit = extracted.limit;
                pagination.total = extracted.total;
            } else {
                operations.value = [];
                pagination.total = 0;
            }
        } catch (e: any) {
            error.value = e?.data?.message ?? 'Error al cargar operaciones del template';
            operations.value = [];
            pagination.total = 0;
        } finally {
            loading.value = false;
        }
    };

    const applySelectedOperation = (selectedOperationId: string) => {
        const selectedOperation = operationOptions.value.find((operation) => operation.id === selectedOperationId);
        if (!selectedOperation) return;

        setValues({
            name: selectedOperation.name,
            code: selectedOperation.code ?? '',
            description: selectedOperation.description ?? '',
            priority: selectedOperation.priority,
            weightPercent: selectedOperation.weightPercent ?? 0,
            order: order.value ?? 0,
            areaOperationId: selectedOperation.id,
        });
    };

    const openCreate = async () => {
        modalMode.value = 'create';
        editingId.value = null;
        formError.value = null;
        resetForm();
        await loadOperationOptions();
        isModalOpen.value = true;
    };

    const openEdit = async (operation: TemplateOperation) => {
        modalMode.value = 'edit';
        editingId.value = operation.id;
        formError.value = null;
        resetForm();

        let source = operation;
        try {
            const res = await svc.findOne(templateId, operation.id);
            const raw = unwrapResponseData(res);
            const normalized = normalizeOperation(raw, 0, 1, 1);
            if (normalized) source = normalized;
        } catch {
            source = operation;
        }

        await loadOperationOptions();

        setValues({
            name: source.name,
            code: source.code ?? '',
            description: source.description ?? '',
            priority: source.priority,
            weightPercent: source.weightPercent,
            order: source.order,
            areaOperationId: source.areaOperationId,
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

    const changePage = async (newPage: number) => {
        const page = Math.max(1, Math.min(totalPages.value, newPage));
        if (page === pagination.page) return;
        pagination.page = page;
        await loadOperations();
    };

    const changeLimit = async (newLimit: number) => {
        const validLimits = [10, 20, 50, 100];
        const limit = validLimits.includes(newLimit) ? newLimit : 10;

        if (limit === pagination.limit) return;

        pagination.limit = limit;
        pagination.page = 1;
        await loadOperations();
    };

    const setFilter = (key: keyof typeof filters, value: string) => {
        filters[key] = value as any;
        pagination.page = 1;
    };

    const handleDelete = async (operation: TemplateOperation) => {
        const confirmed = await confirmAlert(`¿Eliminar la operación "${operation.name}" del template?`);
        if (!confirmed) return;

        try {
            await svc.remove(templateId, operation.id);
            await successAlert('Operación eliminada correctamente.');
            await loadOperations();
        } catch (e: any) {
            await errorAlert(e?.data?.message ?? 'Error al eliminar la operación.');
        }
    };

const buildPayload = (values: Record<string, any>): TemplateOperationUpsertPayload => ({
    name: String(values.name).trim(),
    code: String(values.code).trim(),
    description: values.description ? String(values.description).trim() : '',
    priority: normalizePriority(values.priority),
        weightPercent: Number(values.weightPercent),
        order: Number(values.order),
        areaOperationId: String(values.areaOperationId),
    });

    const onSubmit = handleSubmit(async (values) => {
        await submit({
            payload: () => buildPayload(values),
            onCreate: (payload) => svc.create(templateId, payload),
            onUpdate: (id, payload) => svc.update(templateId, id, payload),
            editingId,
            modalMode,
            saving,
            formError,
            successMessage: {
                create: 'Operación agregada al template correctamente.',
                update: 'Operación del template actualizada correctamente.',
            },
            onSuccess: async () => {
                closeModal(true);
                await loadOperations();
            },
        });
    });

    onMounted(async () => {
        await loadTemplate();
        await Promise.all([loadOperationOptions(), loadOperations()]);
    });

    return {
        loading,
        error,
        operations,
        template,
        pagination,
        filters,
        operationOptions,
        loadingOperationOptions,
        isModalOpen,
        modalMode,
        saving,
        formError,
        name,
        nameAttrs,
        code,
        codeAttrs,
        description,
        descriptionAttrs,
        priority,
        priorityAttrs,
        weightPercent,
        weightPercentAttrs,
        order,
        orderAttrs,
        areaOperationId,
        areaOperationIdAttrs,
        errors,
        openCreate,
        openEdit,
        closeModal,
        onSubmit,
        handleDelete,
        applySelectedOperation,
        loadOperations,
        changePage,
        changeLimit,
        setFilter,
    };
};
