<template>
    <div class="panel">
        <div class="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <p class="text-sm text-gray-500">
                {{ loading ? 'Cargando...' : `Mostrando ${templates.length} de ${pagination.total} templates` }}
            </p>

            <div class="grid grid-cols-1 gap-3 md:grid-cols-4">
                <input v-model="localSearch" type="text" class="form-input min-w-[220px]" placeholder="Buscar por nombre"
                    @keyup.enter="emitFilters" />
                <select v-model="localProjectId" class="form-select min-w-[220px]">
                    <option value="">Todos los proyectos</option>
                    <option v-for="project in projects" :key="project.id" :value="project.id">
                        {{ project.name }}
                    </option>
                </select>
                <select v-model="localAreaId" class="form-select min-w-[220px]"
                    :disabled="!localProjectId || loadingFilterAreas || filterAreas.length === 0">
                    <option value="">
                        {{ !localProjectId ? 'Todas las áreas' : 'Filtrar por área' }}
                    </option>
                    <option v-for="area in filterAreas" :key="area.id" :value="area.id">
                        {{ area.name }}
                    </option>
                </select>
                <button type="button" class="btn btn-outline-primary" @click="emitFilters">
                    Aplicar filtros
                </button>
            </div>
        </div>

        <div v-if="error" class="mb-4 text-sm text-red-600">
            {{ error }}
        </div>

        <div class="datatable">
            <vue3-datatable :rows="templates" :columns="columns" :loading="loading" :totalRows="pagination.total"
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

                <template #project="{ value }">
                    <span class="text-sm text-gray-600">
                        {{ resolveProjectName(value) }}
                    </span>
                </template>

                <template #area="{ value }">
                    <span class="text-sm text-gray-600">
                        {{ value.area?.name ?? value.areaId ?? '-' }}
                    </span>
                </template>

                <template #certificateTemplatePdf="{ value }">
                    <span class="max-w-[220px] truncate text-sm text-gray-600">
                        {{ value.certificateTemplatePdf || 'Pendiente' }}
                    </span>
                </template>

                <template #status="{ value }">
                    <span class="badge"
                        :class="value.status === 'ACTIVE' ? 'badge-outline-success' : 'badge-outline-danger'">
                        {{ value.status }}
                    </span>
                </template>

                <template #action="slotProps">
                    <div class="flex items-center justify-end gap-2">
                        <client-only>
                            <button type="button" v-tippy="'Ver'" @click.prevent>
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

import type { AreaMinimal } from '~/types/operation';
import type { Project } from '~/types/project';
import type { TrainingTemplateItem } from '~/types/trainingTemplate';

interface Props {
    loading: boolean;
    error?: string | null;
    templates: TrainingTemplateItem[];
    projects: Project[];
    filterAreas: AreaMinimal[];
    loadingFilterAreas: boolean;
    pagination: {
        page: number;
        limit: number;
        total: number;
    };
    filters: {
        projectId: string | undefined;
        areaId: string | undefined;
        search: string;
    };
    onLoadFilterAreas?: (projectId: string) => Promise<void>;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    edit: [template: TrainingTemplateItem];
    delete: [template: TrainingTemplateItem];
    changePage: [page: number];
    changeLimit: [limit: number];
    applyFilters: [filters: { projectId: string; areaId: string; search: string }];
}>();

const tableSearch = ref('');
const localSearch = ref(props.filters.search ?? '');
const localProjectId = ref(props.filters.projectId ?? '');
const localAreaId = ref(props.filters.areaId ?? '');

watch(
    () => props.filters.search,
    (value) => {
        localSearch.value = value ?? '';
    },
);

watch(
    () => props.filters.projectId,
    (value) => {
        localProjectId.value = value ?? '';
    },
);

watch(
    () => props.filters.areaId,
    (value) => {
        localAreaId.value = value ?? '';
    },
);

watch(localProjectId, async (value, oldValue) => {
    if (value !== oldValue) {
        localAreaId.value = '';
        // Cargar áreas inmediatamente cuando el usuario selecciona un proyecto
        if (value && props.onLoadFilterAreas) {
            await props.onLoadFilterAreas(value);
        }
    }
});

const columns = ref([
    { field: 'rowIndex', title: '#', width: '60px', sort: false },
    { field: 'name', title: 'Nombre', sort: true },
    { field: 'version', title: 'Versión', sort: false },
    { field: 'project', title: 'Proyecto', sort: false },
    { field: 'area', title: 'Área', sort: false },
    { field: 'periodDurationDays', title: 'Días', sort: false },
    { field: 'totalPeriods', title: 'Períodos', sort: false },
    { field: 'minimumPassingScore', title: 'Nota mínima', sort: false },
    { field: 'certificateTemplatePdf', title: 'PDF', sort: false },
    { field: 'status', title: 'Estado', sort: false },
    { field: 'action', title: 'Acciones', sort: false, width: '150px' },
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
        projectId: localProjectId.value,
        areaId: localAreaId.value,
        search: localSearch.value.trim(),
    });
};

const resolveProjectName = (value: TrainingTemplateItem) => {
    if (value.project?.name) return value.project.name;
    if (value.area?.project?.name) return value.area.project.name;
    if (!value.projectId) return '-';

    return props.projects.find((project) => project.id === value.projectId)?.name ?? value.projectId;
};
</script>
