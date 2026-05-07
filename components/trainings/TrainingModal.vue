<template>
    <TransitionRoot appear :show="isOpen" as="template">
        <Dialog as="div" class="relative z-10">
            <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0" enter-to="opacity-100" leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0">
                <div class="fixed inset-0 bg-black/25" />
            </TransitionChild>

            <div class="fixed inset-0 overflow-y-auto">
                <div class="flex min-h-full items-center justify-center p-4 text-center">
                    <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0 scale-95" enter-to="opacity-100 scale-100" leave="duration-200 ease-in" leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95">
                        <DialogPanel class="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                            <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900">
                                {{ mode === 'edit' ? 'Editar training' : 'Crear training' }}
                            </DialogTitle>

                            <div class="mt-5">
                                <TrainingForm
                                    v-model:user-id="userIdProxy"
                                    v-model:template-id="templateIdProxy"
                                    v-model:start-date="startDateProxy"
                                    v-model:status="statusProxy"
                                    v-model:result="resultProxy"
                                    :user-id-attrs="userIdAttrs"
                                    :template-id-attrs="templateIdAttrs"
                                    :start-date-attrs="startDateAttrs"
                                    :status-attrs="statusAttrs"
                                    :result-attrs="resultAttrs"
                                    :errors="errors"
                                    :saving="saving"
                                    :form-error="formError"
                                    :users="users"
                                    :templates="templates"
                                    :status-options="statusOptions"
                                    :result-options="resultOptions"
                                    @submit="emit('submit')"
                                    @cancel="emit('close')"
                                />
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
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue';
import TrainingForm from './TrainingForm.vue';
import type { TrainingResult, TrainingStatus, TrainingTemplateOption, TrainingUserOption } from '~/types/training';

interface Props {
    isOpen: boolean;
    mode?: 'create' | 'edit';
    userId: string | undefined;
    userIdAttrs: BaseFieldProps & GenericObject;
    templateId: string | undefined;
    templateIdAttrs: BaseFieldProps & GenericObject;
    startDate: string | undefined;
    startDateAttrs: BaseFieldProps & GenericObject;
    status: TrainingStatus | undefined;
    statusAttrs: BaseFieldProps & GenericObject;
    result: TrainingResult | undefined;
    resultAttrs: BaseFieldProps & GenericObject;
    errors: Partial<Record<'userId' | 'templateId' | 'startDate' | 'status' | 'result', string | undefined>>;
    saving: boolean;
    formError: string | null;
    users: TrainingUserOption[];
    templates: TrainingTemplateOption[];
    statusOptions: Array<{ label: string; value: TrainingStatus }>;
    resultOptions: Array<{ label: string; value: TrainingResult }>;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    (e: 'update:userId', value: string): void;
    (e: 'update:templateId', value: string): void;
    (e: 'update:startDate', value: string): void;
    (e: 'update:status', value: TrainingStatus): void;
    (e: 'update:result', value: TrainingResult): void;
    (e: 'close'): void;
    (e: 'submit'): void;
}>();

const userIdProxy = computed({
    get: () => props.userId,
    set: (value: string) => emit('update:userId', value),
});

const templateIdProxy = computed({
    get: () => props.templateId,
    set: (value: string) => emit('update:templateId', value),
});

const startDateProxy = computed({
    get: () => props.startDate,
    set: (value: string) => emit('update:startDate', value),
});

const statusProxy = computed({
    get: () => props.status,
    set: (value: TrainingStatus) => emit('update:status', value),
});

const resultProxy = computed({
    get: () => props.result,
    set: (value: TrainingResult) => emit('update:result', value),
});
</script>
