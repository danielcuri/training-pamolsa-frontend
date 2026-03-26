<template>
    <div>
        <!-- HEADER -->
        <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h1 class="text-2xl font-extrabold uppercase text-primary">
                Áreas
            </h1>

            <div class="flex items-center gap-2">
                <button type="button" class="btn btn-primary" @click="() => openCreate()">
                    <icon-plus class="mr-2" />
                    Agregar
                </button>
            </div>
        </div>

        <!-- LISTA -->
        <AreaList :loading="loading" :error="error" :areas="areas" :pagination="pagination" @edit="openEdit"
            @delete="handleDelete" @change-page="handlePageChange" @change-limit="handleLimitChange"
            @filter-project="handleProjectFilter" />

        <!-- MODAL -->
        <AreaModal v-model:name="name" v-model:status="status" v-model:project-id="projectId" :name-attrs="nameAttrs"
            :status-attrs="statusAttrs" :project-id-attrs="projectIdAttrs" :errors="errors" :is-open="isModalOpen"
            :mode="modalMode" :saving="saving" :form-error="formError" :projects="projects" @close="closeModal"
            @submit="onSubmit" />
    </div>
</template>

<script setup lang="ts">
import AreaModal from '~/components/areas/AreaModal.vue'
import AreaList from '~/components/areas/AreaList.vue'
import { useAreas } from '~/composables/useAreas'
import { useProjects } from '~/composables/useProjects'
import { areaService } from '~/services/areaService'
import type { Area } from '~/types/area'

definePageMeta({
    middleware: ['auth', 'role'],
    roles: ['ADMIN', 'SUPERVISOR', 'SUPERADMIN'],
})

// ============ ÁREAS ============
const {
    // List
    loading,
    error,
    areas,
    pagination,
    filters,
    // Modal
    isModalOpen,
    modalMode,
    saving,
    formError,
    // Form
    name,
    nameAttrs,
    status,
    statusAttrs,
    projectId,
    projectIdAttrs,
    errors,
    // Actions
    openCreate,
    openEdit,
    closeModal,
    onSubmit,
    changePage,
    changeLimit,
    setFilter,
    //loadAreas,
} = useAreas()

// ============ PROYECTOS (para selects) ============
// Cargamos proyectos para los selects de filtro y formulario
const { loadAll: loadAllProjects, projects } = useProjects()

// Cargar proyectos al montar
onMounted(() => {
    loadAllProjects()
})

// ============ HANDLERS ============

const handlePageChange = async (newPage: number) => {
    await changePage(newPage)
}

const handleLimitChange = async (newLimit: number) => {
    await changeLimit(newLimit)
}

const handleProjectFilter = async (projectId: string) => {
    setFilter('projectId', projectId)
    //await loadAreas()
}

const handleDelete = async (area: Area) => {
    if (!confirm(`¿Eliminar el área "${area.name}"?`)) return

    try {
        const { apiFetch } = useApiFetch()
        const svc = areaService(apiFetch)
        await svc.remove(area.id)
        //    await loadAreas()
    } catch (e: any) {
        alert(e?.data?.message || 'Error al eliminar')
    }
}
</script>