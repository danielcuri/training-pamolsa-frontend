<template>
    <div>
        <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
                <NuxtLink to="/training-templates" class="text-sm text-primary hover:underline">
                    Volver a templates
                </NuxtLink>
                <h1 class="text-2xl font-extrabold uppercase text-primary">
                    Template Operations
                </h1>
                <p class="text-sm text-gray-500">
                    {{ template?.name ? `Template: ${template.name}` : `Template ID: ${templateId}` }}
                </p>
            </div>

            <div class="flex items-center gap-2">
                <button type="button" class="btn btn-primary" @click="openCreate">
                    <icon-plus class="mr-2" />
                    Agregar
                </button>
            </div>
        </div>

        <TemplateOperationList :loading="loading" :error="error" :operations="operations" :pagination="pagination"
            :filters="filters" @edit="openEdit" @delete="handleDelete" @change-page="handlePageChange"
            @change-limit="handleLimitChange" @apply-filters="handleApplyFilters" />

        <TemplateOperationModal v-model:name="name" v-model:description="description" v-model:priority="priority"
            v-model:weight-percent="weightPercent" v-model:order="order" v-model:area-operation-id="areaOperationId"
            :name-attrs="nameAttrs" :description-attrs="descriptionAttrs" :priority-attrs="priorityAttrs"
            :weight-percent-attrs="weightPercentAttrs" :order-attrs="orderAttrs" :area-operation-id-attrs="areaOperationIdAttrs" :errors="errors"
            :is-open="isModalOpen" :mode="modalMode" :saving="saving" :form-error="formError"
            :operation-options="operationOptions" :loading-operation-options="loadingOperationOptions"
            :template-project-name="template?.project?.name ?? template?.area?.project?.name ?? '-'" :template-area-name="template?.area?.name ?? '-'"
            @select-operation="applySelectedOperation" @close="closeModal" @submit="onSubmit" />
    </div>
</template>

<script setup lang="ts">
import TemplateOperationList from '~/components/templateOperations/TemplateOperationList.vue';
import TemplateOperationModal from '~/components/templateOperations/TemplateOperationModal.vue';
import { useTemplateOperations } from '~/composables/useTemplateOperations';

definePageMeta({
    middleware: ['auth', 'role'],
    roles: ['ADMIN', 'SUPERVISOR', 'SUPERADMIN'],
});

const route = useRoute();
const templateId = computed(() => String(route.params.templateId ?? ''));

const {
    loading,
    error,
    operations,
    template,
    pagination,
    filters,
    operationOptions,
    loadingOperationOptions,
    isModalOpen,
    modalMode,
    saving,
    formError,
    name,
    nameAttrs,
    description,
    descriptionAttrs,
    priority,
    priorityAttrs,
    weightPercent,
    weightPercentAttrs,
    order,
    orderAttrs,
    areaOperationId,
    areaOperationIdAttrs,
    errors,
    openCreate,
    openEdit,
    closeModal,
    applySelectedOperation,
    onSubmit,
    handleDelete,
    loadOperations,
    changePage,
    changeLimit,
    setFilter,
} = useTemplateOperations(templateId.value);

const handlePageChange = async (newPage: number) => {
    await changePage(newPage);
};

const handleLimitChange = async (newLimit: number) => {
    await changeLimit(newLimit);
};

const handleApplyFilters = async ({ search }: { search: string }) => {
    setFilter('search', search);
    await loadOperations();
};
</script>
