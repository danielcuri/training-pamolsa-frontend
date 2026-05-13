<template>
    <TransitionRoot appear :show="isOpen" as="template">
        <Dialog as="div" class="relative z-10">
            <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0" enter-to="opacity-100"
                leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0">
                <div class="fixed inset-0 bg-black/25" />
            </TransitionChild>

            <div class="fixed inset-0 overflow-y-auto">
                <div class="flex min-h-full items-center justify-center p-4 text-center">
                    <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0 scale-95"
                        enter-to="opacity-100 scale-100" leave="duration-200 ease-in" leave-from="opacity-100 scale-100"
                        leave-to="opacity-0 scale-95">
                        <DialogPanel
                            class="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                            <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900">
                                {{ mode === 'create' ? 'Crear template' : 'Editar template' }}
                            </DialogTitle>

                            <div class="mt-5">
                                <TrainingTemplateForm v-model:name="nameProxy" v-model:version="versionProxy"
                                    v-model:period-duration-days="periodDurationDaysProxy"
                                    v-model:total-periods="totalPeriodsProxy"
                                    v-model:minimum-passing-score="minimumPassingScoreProxy"
                                    v-model:certificate-template-pdf="certificateTemplatePdfProxy"
                                    v-model:status="statusProxy" v-model:area-id="areaIdProxy"
                                    v-model:selected-project-id="selectedProjectIdProxy" :name-attrs="nameAttrs"
                                    :version-attrs="versionAttrs" :period-duration-days-attrs="periodDurationDaysAttrs"
                                    :total-periods-attrs="totalPeriodsAttrs"
                                    :minimum-passing-score-attrs="minimumPassingScoreAttrs"
                                    :certificate-template-pdf-attrs="certificateTemplatePdfAttrs"
                                    :status-attrs="statusAttrs" :area-id-attrs="areaIdAttrs" :errors="errors"
                                    :saving="saving" :form-error="formError" :projects="projects"
                                    :available-areas="availableAreas" :loading-areas="loadingAreas"
                                    @submit="emit('submit')" @cancel="emit('close')" />
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </div>
        </Dialog>
    </TransitionRoot>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { BaseFieldProps, GenericObject } from 'vee-validate';
import {
    TransitionRoot,
    TransitionChild,
    Dialog,
    DialogPanel,
    DialogTitle,
} from '@headlessui/vue';

import TrainingTemplateForm from './TrainingTemplateForm.vue';
import type { AreaMinimal } from '~/types/operation';
import type { Project } from '~/types/project';
import type { TrainingTemplateStatus } from '~/types/trainingTemplate';

interface Props {
    isOpen: boolean;
    mode: 'create' | 'edit';
    name: string | undefined;
    nameAttrs: BaseFieldProps & GenericObject;
    version: string | number | undefined;
    versionAttrs: BaseFieldProps & GenericObject;
    periodDurationDays: string | number | undefined;
    periodDurationDaysAttrs: BaseFieldProps & GenericObject;
    totalPeriods: string | number | undefined;
    totalPeriodsAttrs: BaseFieldProps & GenericObject;
    minimumPassingScore: string | number | undefined;
    minimumPassingScoreAttrs: BaseFieldProps & GenericObject;
    certificateTemplatePdf: string | undefined;
    certificateTemplatePdfAttrs: BaseFieldProps & GenericObject;
    status: TrainingTemplateStatus | undefined;
    statusAttrs: BaseFieldProps & GenericObject;
    areaId: string | undefined;
    areaIdAttrs: BaseFieldProps & GenericObject;
    errors: Partial<
        Record<
            | 'name'
            | 'version'
            | 'periodDurationDays'
            | 'totalPeriods'
            | 'minimumPassingScore'
            | 'certificateTemplatePdf'
            | 'status'
            | 'projectId'
            | 'areaId',
            string | undefined
        >
    >;
    saving: boolean;
    formError: string | null;
    projects: Project[];
    availableAreas: AreaMinimal[];
    loadingAreas: boolean;
    selectedProjectId: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    (e: 'update:name', value: string): void;
    (e: 'update:version', value: string): void;
    (e: 'update:periodDurationDays', value: string): void;
    (e: 'update:totalPeriods', value: string): void;
    (e: 'update:minimumPassingScore', value: string): void;
    (e: 'update:certificateTemplatePdf', value: string): void;
    (e: 'update:status', value: TrainingTemplateStatus): void;
    (e: 'update:areaId', value: string): void;
    (e: 'update:selectedProjectId', value: string): void;
    (e: 'close'): void;
    (e: 'submit'): void;
}>();

const nameProxy = computed({
    get: () => props.name,
    set: (value: string) => emit('update:name', value),
});

const versionProxy = computed({
    get: () => props.version,
    set: (value: string) => emit('update:version', value),
});

const periodDurationDaysProxy = computed({
    get: () => props.periodDurationDays,
    set: (value: string) => emit('update:periodDurationDays', value),
});

const totalPeriodsProxy = computed({
    get: () => props.totalPeriods,
    set: (value: string) => emit('update:totalPeriods', value),
});

const minimumPassingScoreProxy = computed({
    get: () => props.minimumPassingScore,
    set: (value: string) => emit('update:minimumPassingScore', value),
});

const certificateTemplatePdfProxy = computed({
    get: () => props.certificateTemplatePdf,
    set: (value: string) => emit('update:certificateTemplatePdf', value),
});

const statusProxy = computed({
    get: () => props.status,
    set: (value: TrainingTemplateStatus) => emit('update:status', value),
});

const areaIdProxy = computed({
    get: () => props.areaId,
    set: (value: string) => emit('update:areaId', value),
});

const selectedProjectIdProxy = computed({
    get: () => props.selectedProjectId,
    set: (value: string) => emit('update:selectedProjectId', value),
});
</script>
