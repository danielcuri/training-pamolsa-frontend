<template>
    <div class="panel">
        <!-- Header -->
        <div class="mb-5 flex flex-col gap-5 md:flex-row md:items-center">
            <p class="text-sm text-gray-500">
                {{ loading ? 'Cargando...' : 'Listado de proyectos' }}
            </p>

            <!-- <div class="ltr:ml-auto rtl:mr-auto">
                <input v-model="search" type="text" class="form-input w-auto" placeholder="Buscar..." />
            </div> -->
        </div>

        <!-- Error -->
        <div v-if="error" class="mb-4 text-sm text-red-600">
            {{ error }}
        </div>

        <!-- Datatable -->
        <div class="datatable">
            <vue3-datatable :rows="projects" :columns="columnsName" :loading="loading" :totalRows="pagination.total"
                :isServerMode="true" :pageSize="pagination.limit" :sortable="true" :search="search2"
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
                <!-- Custom cell templates -->
                <template #rowIndex="{ value }">
                    {{ value.rowIndex }}
                </template>
                <template #status="{ value }">
                    <span class="badge"
                        :class="value.status === 'ACTIVE' ? 'badge-outline-success' : 'badge-outline-danger'">
                        {{ value.status }}
                    </span>
                </template>
                <template #action="slotProps">
                    <div class="flex items-center">
                        <client-only>
                            <div>
                                <button type="button" class="ltr:mr-2 rtl:ml-2" v-tippy:edit
                                    @click="console.log(slotProps); emit('edit', slotProps.value)">
                                    <icon-pencil />
                                </button>
                                <tippy target="edit">Edit</tippy>
                            </div>
                            <div>
                                <button type="button" v-tippy:delete @click="emit('edit', slotProps.value)">
                                    <icon-trash-lines />
                                </button>
                                <tippy target="delete">Delete</tippy>
                            </div>
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
import type { Project } from '~/types/project'

interface Props {
    loading: boolean
    error?: string | null
    projects: Project[]
    pagination: {
        page: number
        limit: number
        total: number
    }
}

const props = defineProps<Props>()
const emit = defineEmits(['edit', 'changePage', 'changeLimit'])
const search2 = ref('');
// Local state
const columnsName =
    ref([
        { field: 'rowIndex', title: '#', width: '60px', sort: false },
        { field: 'name', title: 'Nombre', sort: true },
        { field: 'status', title: 'Estado', sort: false },
        { field: 'action', title: 'Acciones', sort: false, width: '100px' },
    ]) || [];


const handleChange = (event: any) => {

    const { current_page, pagesize } = event

    if (current_page !== props.pagination.page) {
        emit('changePage', current_page)
    }

    if (pagesize !== props.pagination.limit) {
        emit('changeLimit', pagesize)
    }
}

</script>