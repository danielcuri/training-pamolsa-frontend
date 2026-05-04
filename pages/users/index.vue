<template>
    <div>
        <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h1 class="text-2xl font-extrabold uppercase text-primary">
                Usuarios
            </h1>

            <div class="flex items-center gap-2">
                <button type="button" class="btn btn-primary" @click="openCreate">
                    <icon-plus class="mr-2" />
                    Agregar
                </button>
            </div>
        </div>

        <UserList :loading="loading" :error="error" :users="users" :projects="projects" :pagination="pagination"
            :filters="filters" @edit="openEdit" @delete="handleDelete" @change-page="handlePageChange"
            @change-limit="handleLimitChange" @apply-filters="handleApplyFilters" />

        <UserModal v-model:name="name" v-model:email="email" v-model:dni="dni" v-model:password="password"
            v-model:education-level="educationLevel" v-model:hire-date="hireDate" v-model:role="role"
            v-model:status="status" v-model:area-id="areaId" v-model:selected-project-id="selectedProjectId"
            :name-attrs="nameAttrs" :email-attrs="emailAttrs" :dni-attrs="dniAttrs" :password-attrs="passwordAttrs"
            :education-level-attrs="educationLevelAttrs" :hire-date-attrs="hireDateAttrs" :role-attrs="roleAttrs"
            :status-attrs="statusAttrs" :area-id-attrs="areaIdAttrs" :errors="errors" :is-open="isModalOpen"
            :mode="modalMode" :saving="saving" :form-error="formError" :projects="projects"
            :available-areas="availableAreas" :loading-areas="loadingAreas" @close="closeModal" @submit="onSubmit" />
    </div>
</template>

<script setup lang="ts">
import UserList from '~/components/users/UserList.vue';
import UserModal from '~/components/users/UserModal.vue';
import { useProjects } from '~/composables/useProjects';
import { useUsers } from '~/composables/useUsers';

definePageMeta({
    middleware: ['auth', 'role'],
    roles: ['ADMIN', 'SUPERVISOR', 'SUPERADMIN'],
});

const {
    loading,
    error,
    users,
    pagination,
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
    areaId,
    areaIdAttrs,
    errors,
    openCreate,
    openEdit,
    closeModal,
    onSubmit,
    handleDelete,
    changePage,
    changeLimit,
    setFilter,
    loadUsers,
} = useUsers();

const { loadAll: loadAllProjects, projects } = useProjects();

onMounted(() => {
    loadAllProjects();
});

const handlePageChange = async (newPage: number) => {
    await changePage(newPage);
};

const handleLimitChange = async (newLimit: number) => {
    await changeLimit(newLimit);
};

const handleApplyFilters = async ({ projectId, search }: { projectId: string; search: string }) => {
    setFilter('projectId', projectId);
    setFilter('search', search);
    await loadUsers();
};
</script>
