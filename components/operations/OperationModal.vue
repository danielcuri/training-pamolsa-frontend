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
                            class="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                            <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900">
                                {{ mode === 'create' ? 'Crear operación' : 'Editar operación' }}
                            </DialogTitle>

                            <div class="mt-5">
                                <OperationForm v-model:name="nameProxy" v-model:description="descriptionProxy"
                                    v-model:priority="priorityProxy" v-model:weight-percent="weightPercentForForm"
                                    v-model:status="statusProxy" v-model:area-id="areaIdProxy"
                                    v-model:selected-project-id="selectedProjectIdProxy" :name-attrs="nameAttrs"
                                    :description-attrs="descriptionAttrs" :priority-attrs="priorityAttrs"
                                    :weight-percent-attrs="weightPercentAttrs" :status-attrs="statusAttrs"
                                    :area-id-attrs="areaIdAttrs" :errors="errors" :saving="saving"
                                    :form-error="formError" :mode="mode" :projects="projects"
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
import OperationForm from './OperationForm.vue';
import type { BaseFieldProps, GenericObject } from 'vee-validate';
import type { OperationStatus, OperationPriority, AreaMinimal } from '~/types/operation';
import type { Project } from '~/types/project';
import {
    TransitionRoot,
    TransitionChild,
    Dialog,
    DialogPanel,
    DialogTitle,
} from '@headlessui/vue'

interface Props {
    isOpen: boolean;
    mode: 'create' | 'edit';
    name: string | undefined;
    nameAttrs: BaseFieldProps & GenericObject;
    description: string | undefined;
    descriptionAttrs: BaseFieldProps & GenericObject;
    priority: OperationPriority | undefined;
    priorityAttrs: BaseFieldProps & GenericObject;
    weightPercent: number | string | undefined;
    weightPercentAttrs: BaseFieldProps & GenericObject;
    status: OperationStatus | undefined;
    statusAttrs: BaseFieldProps & GenericObject;
    areaId: string | undefined;
    areaIdAttrs: BaseFieldProps & GenericObject;
    errors: Partial<Record<'name' | 'description' | 'priority' | 'weightPercent' | 'status' | 'areaId', string | undefined>>;
    saving: boolean;
    formError: string | null;
    // Selects anidados
    projects: Project[];
    availableAreas: AreaMinimal[];
    loadingAreas: boolean;
    selectedProjectId: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    (e: 'update:name', value: string): void;
    (e: 'update:description', value: string): void;
    (e: 'update:priority', value: OperationPriority): void;
    (e: 'update:weightPercent', value: number | undefined): void;
    (e: 'update:status', value: OperationStatus): void;
    (e: 'update:areaId', value: string): void;
    (e: 'update:selectedProjectId', value: string): void;
    (e: 'close'): void;
    (e: 'submit'): void;
}>();

// Proxies que pasan hacia arriba
const nameProxy = computed({
    get: () => props.name,
    set: (v: string) => emit('update:name', v),
});

const descriptionProxy = computed({
    get: () => props.description,
    set: (v: string) => emit('update:description', v),
});

const priorityProxy = computed({
    get: () => props.priority,
    set: (v: OperationPriority) => emit('update:priority', v),
});

const weightPercentProxy = computed({
    get: () => props.weightPercent,
    set: (v: number | string | undefined) => {
        const numValue = v === '' || v === undefined ? undefined : Number(v);
        emit('update:weightPercent', numValue);
    },
});
const weightPercentForForm = computed<number | undefined>({
    get: () => {
        const val = props.weightPercent;
        return val === '' || val === undefined ? undefined : Number(val);
    },
    set: (v: number | undefined) => {
        emit('update:weightPercent', v);
    },
});

const statusProxy = computed({
    get: () => props.status,
    set: (v: OperationStatus) => emit('update:status', v),
});

const areaIdProxy = computed({
    get: () => props.areaId,
    set: (v: string) => emit('update:areaId', v),
});

// Proxy para el proyecto seleccionado (controla el select anidado)
const selectedProjectIdProxy = computed({
    get: () => props.selectedProjectId,
    set: (v: string) => emit('update:selectedProjectId', v),
});
</script>