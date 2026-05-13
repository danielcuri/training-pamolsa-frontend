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
                                {{ mode === 'create' ? 'Crear operacion del template' : 'Editar operacion del template' }}
                            </DialogTitle>

                            <div class="mt-5">
                                <TemplateOperationForm v-model:name="nameProxy" v-model:code="codeProxy" v-model:description="descriptionProxy"
                                    v-model:priority="priorityProxy" v-model:weight-percent="weightPercentProxy"
                                    v-model:order="orderProxy" v-model:area-operation-id="areaOperationIdProxy" :name-attrs="nameAttrs"
                                    :code-attrs="codeAttrs" :description-attrs="descriptionAttrs" :priority-attrs="priorityAttrs"
                                    :weight-percent-attrs="weightPercentAttrs" :order-attrs="orderAttrs" :area-operation-id-attrs="areaOperationIdAttrs"
                                    :errors="errors" :saving="saving" :form-error="formError" :operation-options="operationOptions"
                                    :loading-operation-options="loadingOperationOptions" :template-project-name="templateProjectName"
                                    :template-area-name="templateAreaName" @select-operation="emit('selectOperation', $event)"
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
import {
    TransitionRoot,
    TransitionChild,
    Dialog,
    DialogPanel,
    DialogTitle,
} from '@headlessui/vue';
import type { BaseFieldProps, GenericObject } from 'vee-validate';

import TemplateOperationForm from './TemplateOperationForm.vue';
import type { Operation, OperationPriority } from '~/types/operation';

interface Props {
    isOpen: boolean;
    mode: 'create' | 'edit';
    name: string | undefined;
    nameAttrs: BaseFieldProps & GenericObject;
    code: string | undefined;
    codeAttrs: BaseFieldProps & GenericObject;
    description: string | undefined;
    descriptionAttrs: BaseFieldProps & GenericObject;
    priority: OperationPriority | undefined;
    priorityAttrs: BaseFieldProps & GenericObject;
    weightPercent: number | undefined;
    weightPercentAttrs: BaseFieldProps & GenericObject;
    order: number | undefined;
    orderAttrs: BaseFieldProps & GenericObject;
    areaOperationId: string | undefined;
    areaOperationIdAttrs: BaseFieldProps & GenericObject;
    errors: Partial<
        Record<'name' | 'code' | 'description' | 'priority' | 'weightPercent' | 'order' | 'areaOperationId', string | undefined>
    >;
    saving: boolean;
    formError: string | null;
    operationOptions: Operation[];
    loadingOperationOptions: boolean;
    templateProjectName?: string;
    templateAreaName?: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    (e: 'update:name', value: string): void;
    (e: 'update:code', value: string): void;
    (e: 'update:description', value: string): void;
    (e: 'update:priority', value: OperationPriority): void;
    (e: 'update:weightPercent', value: number | undefined): void;
    (e: 'update:order', value: number | undefined): void;
    (e: 'update:areaOperationId', value: string): void;
    (e: 'selectOperation', value: string): void;
    (e: 'close'): void;
    (e: 'submit'): void;
}>();

const nameProxy = computed({
    get: () => props.name,
    set: (value: string) => emit('update:name', value),
});

const codeProxy = computed({
    get: () => props.code,
    set: (value: string) => emit('update:code', value),
});

const descriptionProxy = computed({
    get: () => props.description,
    set: (value: string) => emit('update:description', value),
});

const priorityProxy = computed({
    get: () => props.priority,
    set: (value: OperationPriority) => emit('update:priority', value),
});

const weightPercentProxy = computed({
    get: () => props.weightPercent,
    set: (value: number | undefined) => emit('update:weightPercent', value),
});

const orderProxy = computed({
    get: () => props.order,
    set: (value: number | undefined) => emit('update:order', value),
});

const areaOperationIdProxy = computed({
    get: () => props.areaOperationId,
    set: (value: string) => emit('update:areaOperationId', value),
});
</script>
