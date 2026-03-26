<template>
    <div>
        <!-- HEADER -->
        <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h1 class="text-2xl font-extrabold uppercase text-primary">
                Proyectos
            </h1>

            <div class="flex items-center gap-2">
                <button type="button" class="btn btn-primary" @click="openCreate">
                    <icon-plus class="mr-2" />
                    Agregar
                </button>
            </div>
        </div>

        <!-- LISTA -->
        <ProjectList :loading="loading" :error="error" :projects="projects" :pagination="pagination" @edit="openEdit"
            @change-page="handlePageChange" @change-limit="handleLimitChange" />

        <!-- MODAL -->
        <ProjectModal v-model:name="name" v-model:status="status" :name-attrs="nameAttrs" :status-attrs="statusAttrs"
            :errors="errors" :is-open="isModalOpen" :mode="modalMode" :saving="saving" :form-error="formError"
            @close="closeModal" @submit="onSubmit" />
    </div>
</template>

<script setup lang="ts">
import ProjectModal from '~/components/projects/ProjectModal.vue'
import ProjectList from '~/components/projects/ProjectList.vue'
import { useProjects } from '~/composables/useProjects'

definePageMeta({
    middleware: ['auth', 'role'],
    roles: ['ADMIN', 'SUPERVISOR', 'SUPERADMIN'],
})

const {
    loading,
    error,
    projects,
    pagination,
    changePage,
    isModalOpen,
    modalMode,
    saving,
    formError,
    name,
    nameAttrs,
    status,
    statusAttrs,
    errors,
    openCreate,
    openEdit,
    closeModal,
    onSubmit,
    changeLimit
} = useProjects()
const handlePageChange = async (newPage: number) => {
    await changePage(newPage)
}

const handleLimitChange = async (newLimit: number) => {
    // Actualizar limit y resetear a página 1
    // pagination.limit = newLimit
    // pagination.page = 1
    // await changePage(1)
    await changeLimit(newLimit)
}
</script>