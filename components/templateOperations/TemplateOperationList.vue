<template>
    <div class="panel">
        <div class="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <p class="text-sm text-gray-500">
                {{ loading ? 'Cargando...' : `Mostrando ${operations.length} de ${pagination.total} operaciones` }}
            </p>

            <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
                <input v-model="localSearch" type="text" class="form-input min-w-[220px]" placeholder="Buscar por nombre"
                    @keyup.enter="emitFilters" />
                <button type="button" class="btn btn-outline-primary" @click="emitFilters">
                    Buscar
                </button>
            </div>
        </div>

        <div v-if="error" class="mb-4 text-sm text-red-600">
            {{ error }}
        </div>

        <div class="datatable">
            <vue3-datatable :rows="operations" :columns="columns" :loading="loading" :totalRows="pagination.total"
                :isServerMode="true" :pageSize="pagination.limit" :sortable="true" :search="tableSearch" @change="handleChange"
                skin="whitespace-nowrap bh-table-hover" firstArrow='<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-4.5 h-4.5 rtl:rotate-180">
<path d="M13 19L7 12L13 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path opacity="0.5" d="M16.9998 19L10.9998 12L16.9998 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>' lastArrow='<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-4.5 h-4.5 rtl:rotate-180">
<path d="M11 19L17 12L11 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path opacity="0.5" d="M6.99976 19L12.9998 12L6.99976 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
' previousArrow='<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-4.5 h-4.5 rtl:rotate-180">
<path d="M15 5L9 12L15 19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>' nextArrow='<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-4.5 h-4.5 rtl:rotate-180">
<path d="M9 5L15 12L9 19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>'>
                <template #rowIndex="{ value }">
                    {{ value.rowIndex }}
                </template>

                <template #code="{ value }">
                    <span class="text-sm text-gray-600">
                        {{ value.code || '-' }}
                    </span>
                </template>

                <template #description="{ value }">
                    <span class="block max-w-[220px] truncate text-sm text-gray-600">
                        {{ value.description || '-' }}
                    </span>
                </template>

                <template #priority="{ value }">
                    <span class="badge" :class="{
                        'badge-outline-danger': value.priority === 'CRITICAL',
                        'badge-outline-warning': value.priority === 'SEMI_CRITICAL',
                        'badge-outline-info': value.priority === 'NON_CRITICAL',
                    }">
                        {{ formatPriority(value.priority) }}
                    </span>
                </template>

                <template #weightPercent="{ value }">
                    <span class="text-sm text-gray-600">
                        {{ value.weightPercent }}%
                    </span>
                </template>

                <template #operation="{ value }">
                    <span class="text-sm text-gray-600">
                        {{ value.areaOperation?.name ?? value.areaOperationId ?? '-' }}
                    </span>
                </template>

                <template #action="slotProps">
                    <div class="flex items-center justify-end gap-2">
                        <client-only>
                            <button type="button" class="btn btn-outline-primary btn-sm" v-tippy="'Editar'"
                                @click="emit('edit', slotProps.value)">
                                <icon-pencil class="h-4 w-4" />
                            </button>
                            <button type="button" class="btn btn-outline-danger btn-sm" v-tippy="'Eliminar'"
                                @click="emit('delete', slotProps.value)">
                                <icon-trash-lines class="h-4 w-4" />
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

import type { OperationPriority } from '~/types/operation';
import type { TemplateOperation } from '~/types/templateOperation';

interface Props {
    loading: boolean;
    error?: string | null;
    operations: TemplateOperation[];
    pagination: {
        page: number;
        limit: number;
        total: number;
    };
    filters: {
        search: string;
    };
}

const props = defineProps<Props>();

const emit = defineEmits<{
    edit: [operation: TemplateOperation];
    delete: [operation: TemplateOperation];
    changePage: [page: number];
    changeLimit: [limit: number];
    applyFilters: [filters: { search: string }];
}>();

const tableSearch = ref('');
const localSearch = ref(props.filters.search ?? '');

watch(
    () => props.filters.search,
    (value) => {
        localSearch.value = value ?? '';
    },
);

const columns = ref([
    { field: 'rowIndex', title: '#', width: '60px', sort: false },
    { field: 'name', title: 'Nombre', sort: true },
    { field: 'code', title: 'Codigo', sort: true, width: '140px' },
    { field: 'description', title: 'Descripción', sort: false, width: '220px' },
    { field: 'priority', title: 'Prioridad', sort: false, width: '130px' },
    { field: 'weightPercent', title: 'Peso', sort: false, width: '90px' },
    { field: 'operation', title: 'Operación', sort: false, width: '180px' },
    { field: 'order', title: 'Orden', sort: false, width: '90px' },
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
        search: localSearch.value.trim(),
    });
};

const formatPriority = (priority: OperationPriority) => {
    const labels: Record<OperationPriority, string> = {
        CRITICAL: 'Crítica',
        SEMI_CRITICAL: 'Semi-crítica',
        NON_CRITICAL: 'No crítica',
    };

    return labels[priority] ?? priority;
};
</script>
