import { computed, onMounted, reactive, ref, watch } from 'vue';
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';

import { areaService } from '~/services/areaService';
import { userService } from '~/services/userService';
import { userSchema } from '~/schemas/user.schema';
import { useAlert } from './useAlert';
import { useFormSubmit } from './useFormSubmit';

import type { AreaMinimal } from '~/types/operation';
import type { UserItem, UserListParams, UserRole, UserStatus, UserUpsertPayload } from '~/types/user';

const toDateInput = (value?: string | null) => {
    if (!value) return '';
    return value.slice(0, 10);
};

const toIsoDate = (value: string) => {
    return new Date(`${value}T00:00:00`).toISOString();
};

const normalizeRole = (value: unknown): UserRole | undefined => {
    if (value === 'ADMIN' || value === 'COLLABORATOR' || value === 'SUPERVISOR' || value === 'SUPERADMIN') {
        return value;
    }

    return undefined;
};

export const useUsers = () => {
    const { apiFetch } = useApiFetch();
    const svc = userService(apiFetch);
    const areaSvc = areaService(apiFetch);
    const { submit } = useFormSubmit();
    const { successAlert, errorAlert, confirmAlert } = useAlert();

    const loading = ref(false);
    const error = ref<string | null>(null);
    const users = ref<UserItem[]>([]);

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

    const {
        handleSubmit,
        resetForm,
        setValues,
        setFieldError,
        errors,
        defineField,
    } = useForm({
        validationSchema: toTypedSchema(userSchema),
        initialValues: {
            name: '',
            email: '',
            dni: '',
            password: '',
            educationLevel: '',
            hireDate: '',
            role: 'COLLABORATOR' as UserRole,
            status: 'ACTIVE' as UserStatus,
            projectId: '',
            areaId: '',
        },
    });

    const [name, nameAttrs] = defineField('name');
    const [email, emailAttrs] = defineField('email');
    const [dni, dniAttrs] = defineField('dni');
    const [password, passwordAttrs] = defineField('password');
    const [educationLevel, educationLevelAttrs] = defineField('educationLevel');
    const [hireDate, hireDateAttrs] = defineField('hireDate');
    const [role, roleAttrs] = defineField('role');
    const [status, statusAttrs] = defineField('status');
    const [projectId, projectIdAttrs] = defineField('projectId');
    const [areaId, areaIdAttrs] = defineField('areaId');

    const normalizeStatus = (rawStatus: unknown): UserStatus => {
        if (rawStatus === 'INACTIVE') return 'INACTIVE';
        return 'ACTIVE';
    };

    const normalizeUser = (raw: any, index: number, page: number, limit: number): UserItem | null => {
        const id = raw?.id ?? raw?._id ?? raw?.uuid ?? raw?.userId;
        const rawName = raw?.name;
        const rawEmail = raw?.email;

        if (id == null || rawName == null || rawEmail == null) return null;

        const rawProject = raw?.project;
        const rawArea = raw?.area;

        return {
            id: String(id),
            name: String(rawName),
            email: String(rawEmail),
            dni: raw?.dni ? String(raw.dni) : null,
            educationLevel: raw?.educationLevel ? String(raw.educationLevel) : null,
            hireDate: raw?.hireDate ? String(raw.hireDate) : null,
            role: String(raw?.role ?? ''),
            status: normalizeStatus(raw?.status),
            projectId: raw?.projectId ? String(raw.projectId) : rawProject?.id ? String(rawProject.id) : null,
            areaId: raw?.areaId ? String(raw.areaId) : rawArea?.id ? String(rawArea.id) : null,
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

        const items = Array.isArray(itemsRaw) ? itemsRaw.map((raw: any, index: number) => normalizeUser(raw, index, page, limit)).filter(Boolean) : [];

        return { items, page, limit, total };
    };

    const buildListParams = (): UserListParams => {
        const params: UserListParams = {
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

    const loadAreasByProject = async (currentProjectId: string) => {
        if (!currentProjectId) {
            availableAreas.value = [];
            return;
        }

        loadingAreas.value = true;
        try {
            const res = await areaSvc.list({
                projectId: currentProjectId,
                limit: 100,
            });

            const apiData = res?.data;
            const itemsRaw = Array.isArray(apiData) ? apiData : (apiData?.items ?? apiData?.list ?? apiData?.data ?? []);

            availableAreas.value = Array.isArray(itemsRaw)
                ? itemsRaw
                      .filter((raw: any) => raw?.status === 'ACTIVE')
                      .map((raw: any) => ({
                          id: String(raw?.id),
                          name: String(raw?.name),
                          status: raw?.status,
                      }))
                : [];
        } catch {
            availableAreas.value = [];
        } finally {
            loadingAreas.value = false;
        }
    };

    watch(selectedProjectId, async (newProjectId) => {
        projectId.value = newProjectId;
        await loadAreasByProject(newProjectId);

        if (areaId.value && !availableAreas.value.find((area) => area.id === areaId.value)) {
            areaId.value = '';
        }
    });

    const openCreate = () => {
        modalMode.value = 'create';
        editingId.value = null;
        formError.value = null;
        selectedProjectId.value = '';
        availableAreas.value = [];
        resetForm();
        isModalOpen.value = true;
    };

    const openEdit = async (user: UserItem) => {
        modalMode.value = 'edit';
        editingId.value = user.id;
        formError.value = null;
        resetForm();

        selectedProjectId.value = user.projectId ?? '';
        if (selectedProjectId.value) {
            await loadAreasByProject(selectedProjectId.value);
        } else {
            availableAreas.value = [];
        }

        setValues({
            name: user.name,
            email: user.email,
            dni: user.dni ?? '',
            password: '',
            educationLevel: user.educationLevel ?? '',
            hireDate: toDateInput(user.hireDate),
            role: normalizeRole(user.role),
            status: user.status,
            projectId: user.projectId ?? '',
            areaId: user.areaId ?? '',
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

    const loadUsers = async () => {
        loading.value = true;
        error.value = null;

        try {
            const res = await svc.list(buildListParams());

            if (res.status && res.data) {
                const extracted = extractFromResponse(res);
                users.value = extracted.items as UserItem[];
                pagination.page = extracted.page;
                pagination.limit = extracted.limit;
                pagination.total = extracted.total;
            } else {
                users.value = [];
                pagination.total = 0;
            }
        } catch (e: any) {
            error.value = e?.data?.message ?? 'Error al cargar usuarios';
            users.value = [];
            pagination.total = 0;
        } finally {
            loading.value = false;
        }
    };

    const changePage = async (newPage: number) => {
        const page = Math.max(1, Math.min(totalPages.value, newPage));
        if (page === pagination.page) return;
        pagination.page = page;
        await loadUsers();
    };

    const changeLimit = async (newLimit: number) => {
        const validLimits = [10, 20, 50, 100];
        const limit = validLimits.includes(newLimit) ? newLimit : 10;

        if (limit === pagination.limit) return;

        pagination.limit = limit;
        pagination.page = 1;
        await loadUsers();
    };

    const setFilter = (key: keyof typeof filters, value: string) => {
        filters[key] = value as any;
        pagination.page = 1;
    };

    const handleDelete = async (user: UserItem) => {
        const confirmed = await confirmAlert(`¿Eliminar el usuario "${user.name}"?`);
        if (!confirmed) return;

        try {
            await svc.remove(user.id);
            await successAlert('Usuario eliminado correctamente.');
            await loadUsers();
        } catch (e: any) {
            await errorAlert(e?.data?.message ?? 'Error al eliminar el usuario.');
        }
    };

    const buildPayload = (values: Record<string, any>): UserUpsertPayload => {
        const payload: UserUpsertPayload = {
            name: String(values.name).trim(),
            email: String(values.email).trim(),
            dni: values.dni ? String(values.dni).trim() : null,
            educationLevel: values.educationLevel ? String(values.educationLevel).trim() : null,
            hireDate: toIsoDate(String(values.hireDate)),
            role: values.role as UserRole,
            status: values.status as UserStatus,
            projectId: selectedProjectId.value || null,
            areaId: values.areaId ? String(values.areaId) : null,
        };

        const nextPassword = values.password ? String(values.password).trim() : '';
        if (nextPassword) {
            payload.password = nextPassword;
        }

        return payload;
    };

    const onSubmit = handleSubmit(async (values) => {
        if (modalMode.value === 'create' && !values.password?.trim()) {
            setFieldError('password', 'La contraseña es obligatoria');
            return;
        }

        await submit({
            payload: () => buildPayload(values),
            onCreate: (payload) => svc.create(payload),
            onUpdate: (id, payload) => svc.update(id, payload),
            editingId,
            modalMode,
            saving,
            formError,
            successMessage: {
                create: 'Usuario creado correctamente.',
                update: 'Usuario actualizado correctamente.',
            },
            onSuccess: async () => {
                closeModal(true);
                await loadUsers();
            },
        });
    });

    onMounted(() => {
        loadUsers();
    });

    return {
        loading,
        error,
        users,
        pagination,
        totalPages,
        filters,
        selectedProjectId,
        availableAreas,
        loadingAreas,
        isModalOpen,
        modalMode,
        saving,
        formError,
        name,
        nameAttrs,
        email,
        emailAttrs,
        dni,
        dniAttrs,
        password,
        passwordAttrs,
        educationLevel,
        educationLevelAttrs,
        hireDate,
        hireDateAttrs,
        role,
        roleAttrs,
        status,
        statusAttrs,
        projectId,
        projectIdAttrs,
        areaId,
        areaIdAttrs,
        errors,
        loadUsers,
        loadAreasByProject,
        changePage,
        changeLimit,
        setFilter,
        openCreate,
        openEdit,
        closeModal,
        handleDelete,
        onSubmit,
    };
};
