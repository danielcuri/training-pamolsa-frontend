<template>
    <div class="panel">
        <div class="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <p class="text-sm text-gray-500">
                {{ loading ? 'Cargando...' : `Mostrando ${trainings.length} de ${pagination.total} trainings` }}
            </p>

            <div class="grid grid-cols-1 gap-3 md:grid-cols-4">
                <input v-model="localSearch" type="text" class="form-input min-w-[220px]" placeholder="Buscar training" @keyup.enter="emitFilters" />
                <select v-model="localTemplateId" class="form-select min-w-[220px]">
                    <option value="">Todos los templates</option>
                    <option v-for="template in templates" :key="template.id" :value="template.id">
                        {{ template.name }}
                    </option>
                </select>
                <select v-model="localStatus" class="form-select min-w-[180px]">
                    <option value="">Todos los estados</option>
                    <option v-for="option in statusOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
                </select>
                <select v-model="localResult" class="form-select min-w-[180px]">
                    <option value="">Todos los resultados</option>
                    <option v-for="option in resultOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
                </select>
            </div>
        </div>

        <div class="mb-5 flex justify-end">
            <button type="button" class="btn btn-outline-primary" @click="emitFilters">Aplicar filtros</button>
        </div>

        <div v-if="error" class="mb-4 text-sm text-red-600">
            {{ error }}
        </div>

        <div class="datatable">
            <vue3-datatable
                :rows="trainings"
                :columns="columns"
                :loading="loading"
                :totalRows="pagination.total"
                :isServerMode="true"
                :pageSize="pagination.limit"
                :sortable="true"
                :search="tableSearch"
                @change="handleChange"
                skin="whitespace-nowrap bh-table-hover"
                firstArrow='<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-4.5 h-4.5 rtl:rotate-180"><path d="M13 19L7 12L13 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path opacity="0.5" d="M16.9998 19L10.9998 12L16.9998 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
                lastArrow='<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-4.5 h-4.5 rtl:rotate-180"><path d="M11 19L17 12L11 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path opacity="0.5" d="M6.99976 19L12.9998 12L6.99976 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
                previousArrow='<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-4.5 h-4.5 rtl:rotate-180"><path d="M15 5L9 12L15 19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
                nextArrow='<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-4.5 h-4.5 rtl:rotate-180"><path d="M9 5L15 12L9 19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
            >
                <template #rowIndex="{ value }">
                    {{ value.rowIndex }}
                </template>

                <template #user="{ value }">
                    <span class="text-sm text-gray-600">
                        {{ value.user?.name ?? resolveUserName(value.userId) }}
                    </span>
                </template>

                <template #template="{ value }">
                    <span class="text-sm text-gray-600">
                        {{ value.template?.name ?? resolveTemplateName(value.templateId) }}
                    </span>
                </template>

                <template #startDate="{ value }">
                    <span class="text-sm text-gray-600">
                        {{ formatDate(value.startDate) }}
                    </span>
                </template>

                <template #status="{ value }">
                    <span class="badge" :class="statusBadge(value.status)">
                        {{ value.status }}
                    </span>
                </template>

                <template #result="{ value }">
                    <span class="badge" :class="resultBadge(value.result)">
                        {{ value.result }}
                    </span>
                </template>

                <template #action="slotProps">
                    <div class="flex items-center justify-end gap-2">
                        <client-only>
                            <button type="button" v-tippy="'Ver'" @click="void slotProps.value">
                                <icon-eye />
                            </button>
                            <button type="button" v-tippy="'Editar'" @click="emit('edit', slotProps.value)">
                                <icon-pencil />
                            </button>
                            <button type="button" v-tippy="'Eliminar'" @click="emit('delete', slotProps.value)">
                                <icon-trash-lines />
                            </button>
                        </client-only>
                    </div>
                </template>
            </vue3-datatable>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import Vue3Datatable from '@bhplugin/vue3-datatable';
import type { TrainingItem, TrainingResult, TrainingStatus, TrainingTemplateOption, TrainingUserOption } from '~/types/training';

interface Props {
    loading: boolean;
    error?: string | null;
    trainings: TrainingItem[];
    users: TrainingUserOption[];
    templates: TrainingTemplateOption[];
    pagination: {
        page: number;
        limit: number;
        total: number;
    };
    filters: {
        userId: string | undefined;
        templateId: string | undefined;
        status: TrainingStatus | '';
        result: TrainingResult | '';
        search: string;
    };
    statusOptions: Array<{ label: string; value: TrainingStatus }>;
    resultOptions: Array<{ label: string; value: TrainingResult }>;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    edit: [training: TrainingItem];
    delete: [training: TrainingItem];
    changePage: [page: number];
    changeLimit: [limit: number];
    applyFilters: [filters: { templateId: string; status: TrainingStatus | ''; result: TrainingResult | ''; search: string }];
}>();

const tableSearch = ref('');
const localSearch = ref(props.filters.search ?? '');
const localTemplateId = ref(props.filters.templateId ?? '');
const localStatus = ref(props.filters.status ?? '');
const localResult = ref(props.filters.result ?? '');

watch(() => props.filters.search, (value) => { localSearch.value = value ?? ''; });
watch(() => props.filters.templateId, (value) => { localTemplateId.value = value ?? ''; });
watch(() => props.filters.status, (value) => { localStatus.value = value ?? ''; });
watch(() => props.filters.result, (value) => { localResult.value = value ?? ''; });

const columns = ref([
    { field: 'rowIndex', title: '#', width: '60px', sort: false },
    { field: 'user', title: 'Usuario', sort: false },
    { field: 'template', title: 'Template', sort: false },
    { field: 'startDate', title: 'Fecha inicio', sort: false },
    { field: 'status', title: 'Estado', sort: false },
    { field: 'result', title: 'Resultado', sort: false },
    { field: 'action', title: 'Acciones', sort: false, width: '120px' },
]);

const handleChange = (event: any) => {
    const { current_page, pagesize } = event;

    if (current_page !== props.pagination.page) {
        emit('changePage', current_page);
    }

    if (pagesize !== props.pagination.limit) {
        emit('changeLimit', pagesize);
    }
};

const emitFilters = () => {
    emit('applyFilters', {
        templateId: localTemplateId.value,
        status: localStatus.value as TrainingStatus | '',
        result: localResult.value as TrainingResult | '',
        search: localSearch.value.trim(),
    });
};

const resolveUserName = (userId: string) => props.users.find((user) => user.id === userId)?.name ?? userId ?? '-';
const resolveTemplateName = (templateId: string) => props.templates.find((template) => template.id === templateId)?.name ?? templateId ?? '-';

const formatDate = (value?: string) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('es-PE');
};

const statusBadge = (value: TrainingStatus) => {
    if (value === 'COMPLETED') return 'badge-outline-success';
    if (value === 'IN_PROGRESS') return 'badge-outline-warning';
    return 'badge-outline-primary';
};

const resultBadge = (value: TrainingResult) => {
    return value === 'PASSED' ? 'badge-outline-success' : 'badge-outline-danger';
};
</script>
