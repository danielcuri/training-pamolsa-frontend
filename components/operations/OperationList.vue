<template>
    <div class="panel">
        <!-- Header -->
        <div class="mb-5 flex flex-col gap-5 md:flex-row md:items-center">
            <p class="text-sm text-gray-500">
                {{ loading ? 'Cargando...' : `Mostrando ${operations.length} de ${pagination.total} operaciones` }}
            </p>

        </div>

        <!-- Error -->
        <div v-if="error" class="mb-4 text-sm text-red-600">
            {{ error }}
        </div>

        <!-- Datatable -->
        <div class="datatable">
            <vue3-datatable :rows="operations" :columns="columns" :loading="loading" :totalRows="pagination.total"
                :isServerMode="true" :pageSize="pagination.limit" :sortable="true" :search="search"
                @change="handleChange" skin="whitespace-nowrap bh-table-hover" firstArrow='<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-4.5 h-4.5 rtl:rotate-180">
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
                <!-- Template para rowIndex -->
                <template #rowIndex="{ value }">
                    {{ value.rowIndex }}
                </template>

                <template #code="{ value }">
                    <span class="text-sm text-gray-600">
                        {{ value.code || '-' }}
                    </span>
                </template>



                <!-- Template para description (opcional, truncado) -->
                <template #description="{ value }">
                    <span v-if="value.description" class="text-sm text-gray-600 truncate max-w-[200px] block"
                        :title="value">
                        {{ value.description }}
                    </span>
                    <span v-else class="text-sm text-gray-400">-</span>
                </template>

                <!-- Template para priority -->
                <template #priority="{ value }">
                    <span class="badge" :class="{
                        'badge-outline-danger': value.priority === 'CRITICAL',
                        'badge-outline-warning': value.priority === 'SEMI_CRITICAL',
                        'badge-outline-info': value.priority === 'NON_CRITICAL'
                    }">
                        {{ formatPriority(value.priority) }}

                    </span>
                </template>

                <!-- Template para weightPercent -->
                <template #weightPercent="{ value }">
                    <div class="flex items-center gap-2">
                        <div class="w-16 bg-gray-200 rounded-full h-2">
                            <div class="bg-primary h-2 rounded-full" :style="{ width: `${value || 0}%` }"></div>
                        </div>
                        <span class="text-sm text-gray-600">{{ value.weightPercent || 0 }}%</span>
                    </div>
                </template>

                <!-- Template para area (anidado: operación → área) -->
                <template #area="{ value }">
                    <span v-if="value.area" class="text-sm text-gray-600">
                        {{ value.area.name }}
                    </span>
                    <span v-else class="text-sm text-gray-400">-</span>
                </template>

                <!-- Template para project (anidado: operación → área → proyecto) -->
                <template #project="{ value }">
                    <span v-if="value.area?.project" class="text-sm text-gray-600 font-medium">
                        {{ value.area.project.name }}
                    </span>
                    <span v-else class="text-sm text-gray-400">-</span>
                </template>

                <!-- Template para status -->
                <template #status="{ value }">
                    <span class="badge"
                        :class="value.status === 'ACTIVE' ? 'badge-outline-success' : 'badge-outline-danger'">
                        {{ value.status }}
                    </span>
                </template>

                <!-- Template para action -->
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
import { ref } from 'vue'
import Vue3Datatable from '@bhplugin/vue3-datatable'
import type { Operation, OperationPriority } from '~/types/operation'
import type { Project } from '~/types/project'

interface Props {
    loading: boolean
    error?: string | null
    operations: Operation[]
    pagination: {
        page: number
        limit: number
        total: number
    }
    projects?: Project[] // Opcional: para filtro de proyectos
}

const props = defineProps<Props>()

const emit = defineEmits<{
    edit: [operation: Operation]
    delete: [operation: Operation]
    changePage: [page: number]
    changeLimit: [limit: number]
    filterProject: [projectId: string]
    filterPriority: [priority: OperationPriority | '']
}>()

const search = ref('')
const selectedProject = ref('')
const selectedPriority = ref<OperationPriority | ''>('')

// Columnas con jerarquía completa: operación → área → proyecto
const columns = ref([
    { field: 'rowIndex', title: '#', width: '60px', sort: false },
    { field: 'name', title: 'Nombre', sort: true },
    { field: 'code', title: 'Código', sort: true, width: '140px' },
    { field: 'description', title: 'Descripción', sort: false, width: '200px' },
    { field: 'priority', title: 'Prioridad', sort: false, width: '120px' },
    { field: 'weightPercent', title: 'Peso', sort: false, width: '100px' },
    { field: 'area', title: 'Área', sort: false },           // ← Área anidada
    { field: 'project', title: 'Proyecto', sort: false },    // ← Proyecto anidado (vía área)
    { field: 'status', title: 'Estado', sort: false, width: '100px' },
    { field: 'action', title: 'Acciones', sort: false, width: '120px' },
])

const handleChange = (event: any) => {
    const { current_page, pagesize } = event

    if (current_page !== props.pagination.page) {
        emit('changePage', current_page)
    }

    if (pagesize !== props.pagination.limit) {
        emit('changeLimit', pagesize)
    }
}

const handleProjectFilter = () => {
    emit('filterProject', selectedProject.value)
}

const handlePriorityFilter = () => {
    emit('filterPriority', selectedPriority.value)
}

// Formatear prioridad para mostrar
const formatPriority = (priority: OperationPriority): string => {

    const labels: Record<OperationPriority, string> = {
        'CRITICAL': 'Crítica',
        'SEMI_CRITICAL': 'Semi-crítica',
        'NON_CRITICAL': 'No crítica',
    }
    return labels[priority] || priority
}
</script>
