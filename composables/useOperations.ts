import { computed, onMounted, reactive, ref } from 'vue';
import { operationService } from '~/services/operationService';
import { areaService } from '~/services/areaService';
import { operationSchema } from '~/schemas/operation.schema';
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import type { Operation, OperationStatus, OperationPriority, AreaMinimal, OperationListParams } from '~/types/operation';
import { useFormSubmit } from './useFormSubmit';

export const useOperations = () => {
    const { apiFetch } = useApiFetch();
    const svc = operationService(apiFetch);
    const areaSvc = areaService(apiFetch);
    const { submit } = useFormSubmit();

    // --------------- list state ---------------

    const loading = ref(false);
    const error = ref<string | null>(null);
    const operations = ref<Operation[]>([]);

    // Filtros reactivos
    const filters = reactive({
        projectId: '' as string | undefined,
        areaId: '' as string | undefined,
        priority: '' as OperationPriority | '',
        status: '' as OperationStatus | '',
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

    // --------------- selects anidados (proyecto → área) ---------------

    const selectedProjectId = ref<string>(''); // ← Proyecto seleccionado en el form
    const availableAreas = ref<AreaMinimal[]>([]); // ← Áreas filtradas por proyecto
    const loadingAreas = ref(false); // ← Loading del select de áreas

    // Cargar áreas cuando cambia el proyecto seleccionado
    const loadAreasByProject = async (projectId: string) => {
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
                const res = await areaSvc.list({
                    projectId,
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

            availableAreas.value = aggregatedAreas;
        } catch (e: any) {
            availableAreas.value = [];
        } finally {
            loadingAreas.value = false;
        }
    };

    // Watch para cargar áreas automáticamente
    watch(selectedProjectId, (newProjectId) => {
        // 1. Cargar áreas del nuevo proyecto
        loadAreasByProject(newProjectId);

        // 2. Limpiar área si no pertenece al nuevo proyecto
        if (areaId.value && !availableAreas.value.find((a) => a.id === areaId.value)) {
            areaId.value = '';
        }
    });

    // --------------- form state ---------------

    const isModalOpen = ref(false);
    const modalMode = ref<'create' | 'edit'>('create');
    const saving = ref(false);
    const formError = ref<string | null>(null);
    const editingId = ref<string | null>(null);

    const { handleSubmit, resetForm, setValues, errors, defineField } = useForm({
        validationSchema: toTypedSchema(operationSchema),
        initialValues: {
            name: '',
            code: '',
            description: '',
            priority: 'CRITICAL' as OperationPriority,
            weightPercent: undefined as number | undefined,
            status: 'ACTIVE' as OperationStatus,
            areaId: '',
        },
    });

    const [name, nameAttrs] = defineField('name');
    const [code, codeAttrs] = defineField('code');
    const [description, descriptionAttrs] = defineField('description');
    const [priority, priorityAttrs] = defineField('priority');
    const [weightPercent, weightPercentAttrs] = defineField('weightPercent');
    const [status, statusAttrs] = defineField('status');
    const [areaId, areaIdAttrs] = defineField('areaId'); // ← Mapeado a areaId del schema

    // --------------- helpers ---------------

    const normalizeOperation = (raw: any, index: number, page: number, limit: number): Operation | null => {
        const id = raw?.id ?? raw?._id ?? raw?.uuid;
        const rawName = raw?.name;
        const rawPriority = raw?.priority;

        if (id == null || rawName == null || rawPriority == null) return null;

        // Normalizar área anidada con su proyecto
        const rawArea = raw?.area;
        const area = rawArea
            ? {
                  id: String(rawArea.id),
                  name: String(rawArea.name),
                  status: rawArea.status,
                  projectId: String(rawArea.projectId ?? rawArea.project?.id),
                  project: rawArea.project
                      ? {
                            id: String(rawArea.project.id),
                            name: String(rawArea.project.name),
                        }
                      : undefined,
              }
            : undefined;

        return {
            id: String(id),
            name: String(rawName),
            code: raw?.code != null ? String(raw.code) : undefined,
            description: raw?.description,
            weightPercent: raw?.weightPercent,
            priority: rawPriority,
            status: raw?.status ?? 'ACTIVE',
            areaId: String(raw?.areaId ?? rawArea?.id ?? ''),
            area,
            rowIndex: (page - 1) * limit + index + 1,
        };
    };

    const buildListParams = (): OperationListParams => {
        const params: OperationListParams = {
            page: pagination.page,
            limit: pagination.limit,
        };

        // Construir objeto filter
        const filterObj: Record<string, unknown> = {};

        if (filters.areaId) {
            filterObj.areaId = filters.areaId;
        }

        if (filters.priority) {
            filterObj.priority = filters.priority;
        }

        if (filters.status) {
            filterObj.status = filters.status;
        }

        if (filters.search) {
            filterObj.name__like = filters.search;
        }

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

        const items = Array.isArray(itemsRaw) ? itemsRaw.map((raw: any, index: number) => normalizeOperation(raw, index, page, limit)).filter(Boolean) : [];

        return { items, page, limit, total };
    };

    // --------------- filter actions ---------------

    const setFilter = (key: keyof typeof filters, value: string | OperationPriority | OperationStatus) => {
        filters[key] = value as any;
        pagination.page = 1;
    };

    const clearFilters = () => {
        filters.projectId = '';
        filters.areaId = '';
        filters.priority = '';
        filters.status = '';
        filters.search = '';
        pagination.page = 1;
    };

    const applyFilters = async () => {
        await loadOperations();
    };

    // --------------- modal actions ---------------

    const openCreate = (preselectedProjectId?: string) => {
        modalMode.value = 'create';
        editingId.value = null;
        formError.value = null;
        resetForm();

        // Preseleccionar proyecto si viene (desde vista de proyecto)
        if (preselectedProjectId) {
            selectedProjectId.value = preselectedProjectId;
        }

        isModalOpen.value = true;
    };

    const openEdit = async (operation: Operation) => {
        modalMode.value = 'edit';
        editingId.value = operation.id;
        formError.value = null;
        resetForm();

        // Cargar el proyecto de la operación para el select anidado
        if (operation.area?.projectId) {
            selectedProjectId.value = operation.area.projectId;
            // Esperar a que carguen las áreas
            await loadAreasByProject(operation.area.projectId);
        }

        setValues({
            name: operation.name,
            code: operation.code ?? '',
            description: operation.description ?? '',
            priority: operation.priority,
            weightPercent: operation.weightPercent !== undefined ? Number(operation.weightPercent) : undefined,
            status: operation.status,
            areaId: operation.areaId,
        });

        isModalOpen.value = true;
    };

    const closeModal = (force = false) => {
        if (saving.value && !force) return;
        isModalOpen.value = false;
        editingId.value = null;
        formError.value = null;
        selectedProjectId.value = ''; // Limpiar proyecto seleccionado
        availableAreas.value = []; // Limpiar áreas
        resetForm();
    };

    // --------------- data actions ---------------

    const loadOperations = async () => {
        loading.value = true;
        error.value = null;

        try {
            const params = buildListParams();
            const res = await svc.list(params);

            if (res.status && res.data) {
                const extracted = extractFromResponse(res);
                operations.value = extracted.items as Operation[];
                pagination.page = extracted.page;
                pagination.limit = extracted.limit;
                pagination.total = extracted.total;
            } else {
                operations.value = [];
                pagination.total = 0;
            }
        } catch (e: any) {
            error.value = e?.data?.message ?? 'Error al cargar operaciones';
            operations.value = [];
            pagination.total = 0;
        } finally {
            loading.value = false;
        }
    };

    const changePage = async (newPage: number) => {
        const p = Math.max(1, Math.min(totalPages.value, newPage));
        if (p === pagination.page) return;
        pagination.page = p;
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

    // --------------- submit ---------------

    const onSubmit = handleSubmit(async (values) => {
        await submit({
            payload: () => ({
                name: values.name,
                code: String(values.code ?? ''),
                description: values.description,
                priority: values.priority as OperationPriority,
                weightPercent: values.weightPercent,
                status: values.status as OperationStatus,
                areaId: values.areaId,
            }),
            onCreate: (payload) => svc.create(payload),
            onUpdate: (id, payload) => svc.update(id, payload),
            editingId,
            modalMode,
            saving,
            formError,
            successMessage: {
                create: 'Operación creada correctamente.',
                update: 'Operación actualizada correctamente.',
            },
            onSuccess: async () => {
                closeModal(true);
                await loadOperations();
            },
        });
    });

    onMounted(() => {
        loadOperations();
    });

    return {
        // list
        loading,
        error,
        operations,
        pagination,
        totalPages,
        filters,
        // selects anidados
        selectedProjectId,
        availableAreas,
        loadingAreas,
        loadAreasByProject,
        // modal state
        isModalOpen,
        modalMode,
        saving,
        formError,
        // form fields
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
        status,
        statusAttrs,
        areaId, // ← Este es el areaId del form
        areaIdAttrs,
        errors,
        // filter actions
        setFilter,
        clearFilters,
        applyFilters,
        // pagination
        changePage,
        changeLimit,
        // data
        loadOperations,
        // modal actions
        openCreate,
        openEdit,
        closeModal,
        onSubmit,
    };
};
