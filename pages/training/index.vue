<template>
    <div>
        <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h1 class="text-2xl font-extrabold uppercase text-primary">
                Training
            </h1>

            <div class="flex items-center gap-2">
                <button type="button" class="btn btn-primary" @click="openCreate">
                    <icon-plus class="mr-2" />
                    Agregar
                </button>
            </div>
        </div>

        <TrainingList
            :loading="loading"
            :error="error"
            :trainings="trainings"
            :users="users"
            :templates="templates"
            :pagination="pagination"
            :filters="filters"
            :status-options="statusOptions"
            :result-options="resultOptions"
            @edit="openEdit"
            @delete="handleDelete"
            @change-page="handlePageChange"
            @change-limit="handleLimitChange"
            @apply-filters="handleApplyFilters"
        />

        <TrainingModal
            v-model:user-id="userId"
            v-model:template-id="templateId"
            v-model:start-date="startDate"
            v-model:status="status"
            v-model:result="result"
            :user-id-attrs="userIdAttrs"
            :template-id-attrs="templateIdAttrs"
            :start-date-attrs="startDateAttrs"
            :status-attrs="statusAttrs"
            :result-attrs="resultAttrs"
            :errors="errors"
            :is-open="isModalOpen"
            :mode="modalMode"
            :saving="saving"
            :form-error="formError"
            :users="users"
            :templates="templates"
            :status-options="statusOptions"
            :result-options="resultOptions"
            @close="closeModal"
            @submit="onSubmit"
        />
    </div>
</template>

<script setup lang="ts">
import TrainingList from '~/components/trainings/TrainingList.vue';
import TrainingModal from '~/components/trainings/TrainingModal.vue';
import { useTrainings } from '~/composables/useTrainings';
import type { TrainingResult, TrainingStatus } from '~/types/training';

definePageMeta({
    middleware: ['auth', 'role'],
    roles: ['ADMIN', 'SUPERVISOR', 'SUPERADMIN'],
});

const {
    loading,
    saving,
    error,
    formError,
    trainings,
    users,
    templates,
    pagination,
    filters,
    isModalOpen,
    modalMode,
    statusOptions,
    resultOptions,
    userId,
    userIdAttrs,
    templateId,
    templateIdAttrs,
    startDate,
    startDateAttrs,
    status,
    statusAttrs,
    result,
    resultAttrs,
    errors,
    openCreate,
    openEdit,
    closeModal,
    handleDelete,
    loadTrainings,
    changePage,
    changeLimit,
    setFilter,
    onSubmit,
} = useTrainings();

const handlePageChange = async (newPage: number) => {
    await changePage(newPage);
};

const handleLimitChange = async (newLimit: number) => {
    await changeLimit(newLimit);
};

const handleApplyFilters = async ({
    templateId,
    status,
    result,
    search,
}: {
    templateId: string;
    status: TrainingStatus | '';
    result: TrainingResult | '';
    search: string;
}) => {
    setFilter('userId', '');
    setFilter('templateId', templateId);
    setFilter('status', status);
    setFilter('result', result);
    setFilter('search', search);
    await loadTrainings();
};
</script>
