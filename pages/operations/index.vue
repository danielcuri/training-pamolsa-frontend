<template>
    <div>
        <!-- HEADER -->
        <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h1 class="text-2xl font-extrabold uppercase text-primary">
                Operaciones
            </h1>

            <div class="flex items-center gap-2">
                <button type="button" class="btn btn-primary" @click="() => openCreate()">
                    <icon-plus class="mr-2" />
                    Agregar
                </button>
            </div>
        </div>

        <!-- LISTA -->
        <OperationList :loading="loading" :error="error" :operations="operations" :pagination="pagination"
            :projects="projects" @edit="openEdit" @delete="handleDelete" @change-page="handlePageChange"
            @change-limit="handleLimitChange" @filter-project="handleProjectFilter"
            @filter-priority="handlePriorityFilter" />

        <!-- MODAL -->
        <OperationModal v-model:name="name" v-model:code="code" v-model:description="description" v-model:priority="priority"
            v-model:weight-percent="weightPercent" v-model:status="status" v-model:area-id="areaId"
            v-model:selected-project-id="selectedProjectId" :name-attrs="nameAttrs"
            :code-attrs="codeAttrs" :description-attrs="descriptionAttrs" :priority-attrs="priorityAttrs"
            :weight-percent-attrs="weightPercentAttrs" :status-attrs="statusAttrs" :area-id-attrs="areaIdAttrs"
            :errors="errors" :is-open="isModalOpen" :mode="modalMode" :saving="saving" :form-error="formError"
            :projects="projects" :available-areas="availableAreas" :loading-areas="loadingAreas" @close="closeModal"
            @submit="onSubmit" />
    </div>
</template>

<script setup lang="ts">
import OperationModal from '~/components/operations/OperationModal.vue'
import OperationList from '~/components/operations/OperationList.vue'
import { useOperations } from '~/composables/useOperations'
import { useProjects } from '~/composables/useProjects'
import { operationService } from '~/services/operationService'
import type { Operation, OperationPriority } from '~/types/operation'

definePageMeta({
    middleware: ['auth', 'role'],
    roles: ['ADMIN', 'SUPERVISOR', 'SUPERADMIN'],
})

// ============ OPERACIONES ============
const {
    // List
    loading,
    error,
    operations,
    pagination,
    filters,
    // Selects anidados
    selectedProjectId,
    availableAreas,
    loadingAreas,
    loadAreasByProject,
    // Modal
    isModalOpen,
    modalMode,
    saving,
    formError,
    // Form
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
    areaId,
    areaIdAttrs,
    errors,
    // Actions
    openCreate,
    openEdit,
    closeModal,
    onSubmit,
    changePage,
    changeLimit,
    setFilter,
    loadOperations,
} = useOperations()

// ============ PROYECTOS (para selects) ============
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
    await loadOperations()
}

const handlePriorityFilter = async (priority: OperationPriority | '') => {
    setFilter('priority', priority)
    await loadOperations()
}

const handleDelete = async (operation: Operation) => {
    if (!confirm(`¿Eliminar la operación "${operation.name}"?`)) return

    try {
        const { apiFetch } = useApiFetch()
        const svc = operationService(apiFetch)
        await svc.remove(operation.id)
        await loadOperations()
    } catch (e: any) {
        alert(e?.data?.message || 'Error al eliminar')
    }
}
</script>
