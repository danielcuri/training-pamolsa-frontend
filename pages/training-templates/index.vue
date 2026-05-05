<template>
    <div>
        <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h1 class="text-2xl font-extrabold uppercase text-primary">
                Templates
            </h1>

            <div class="flex items-center gap-2">
                <button type="button" class="btn btn-primary" @click="openCreate">
                    <icon-plus class="mr-2" />
                    Agregar
                </button>
            </div>
        </div>

        <TrainingTemplateList :loading="loading" :error="error" :templates="templates" :projects="projects"
            :filter-areas="filterAreas" :loading-filter-areas="loadingFilterAreas" :pagination="pagination"
            :filters="filters" :on-load-filter-areas="(projectId) => loadAreaOptions(projectId, 'filter')"
            @view="handleView" @edit="openEdit" @delete="handleDelete" @change-page="handlePageChange"
            @change-limit="handleLimitChange" @apply-filters="handleApplyFilters" />

        <TrainingTemplateModal v-model:name="name" v-model:version="version"
            v-model:period-duration-days="periodDurationDays" v-model:total-periods="totalPeriods"
            v-model:minimum-passing-score="minimumPassingScore"
            v-model:certificate-template-pdf="certificateTemplatePdf" v-model:status="status"
            v-model:area-id="areaId" v-model:selected-project-id="selectedProjectId" :name-attrs="nameAttrs"
            :version-attrs="versionAttrs" :period-duration-days-attrs="periodDurationDaysAttrs"
            :total-periods-attrs="totalPeriodsAttrs" :minimum-passing-score-attrs="minimumPassingScoreAttrs"
            :certificate-template-pdf-attrs="certificateTemplatePdfAttrs" :status-attrs="statusAttrs"
            :area-id-attrs="areaIdAttrs" :errors="errors" :is-open="isModalOpen" :mode="modalMode"
            :saving="saving" :form-error="formError" :projects="projects" :available-areas="availableAreas"
            :loading-areas="loadingAreas" @close="closeModal" @submit="onSubmit" />
    </div>
</template>

<script setup lang="ts">
import TrainingTemplateList from '~/components/trainingTemplates/TrainingTemplateList.vue';
import TrainingTemplateModal from '~/components/trainingTemplates/TrainingTemplateModal.vue';
import { useProjects } from '~/composables/useProjects';
import { useTrainingTemplates } from '~/composables/useTrainingTemplates';
import type { TrainingTemplateItem } from '~/types/trainingTemplate';

definePageMeta({
    middleware: ['auth', 'role'],
    roles: ['ADMIN', 'SUPERVISOR', 'SUPERADMIN'],
});

const {
    loading,
    error,
    templates,
    pagination,
    filters,
    filterAreas,
    loadingFilterAreas,
    selectedProjectId,
    availableAreas,
    loadingAreas,
    isModalOpen,
    modalMode,
    saving,
    formError,
    name,
    nameAttrs,
    version,
    versionAttrs,
    periodDurationDays,
    periodDurationDaysAttrs,
    totalPeriods,
    totalPeriodsAttrs,
    minimumPassingScore,
    minimumPassingScoreAttrs,
    certificateTemplatePdf,
    certificateTemplatePdfAttrs,
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
    loadAreaOptions,
    loadTrainingTemplates,
} = useTrainingTemplates();

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

const handleApplyFilters = async ({ projectId, areaId, search }: { projectId: string; areaId: string; search: string }) => {
    setFilter('projectId', projectId);
    setFilter('areaId', areaId);
    setFilter('search', search);
    await loadTrainingTemplates();
};

const handleView = async (template: TrainingTemplateItem) => {
    await navigateTo(`/training-templates/${template.id}/template-operation`);
};
</script>
