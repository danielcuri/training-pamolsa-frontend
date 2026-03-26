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
                            class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                            <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900">
                                {{ mode === 'create' ? 'Crear proyecto' : 'Editar proyecto' }}
                            </DialogTitle>
                            <div class="mt-5">
                                <ProjectForm v-model:name="nameProxy" v-model:status="statusProxy"
                                    :name-attrs="nameAttrs" :status-attrs="statusAttrs" :errors="errors"
                                    :saving="saving" :form-error="formError" @submit="emit('submit')"
                                    @cancel="emit('close')">
                                </ProjectForm>
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
import ProjectForm from './ProjectForm.vue';  // Importa el formulario
import type { BaseFieldProps, GenericObject } from 'vee-validate';
import type { ProjectApiStatus } from '~/types/project';
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
    status: ProjectApiStatus | undefined;
    statusAttrs: BaseFieldProps & GenericObject;
    errors: Partial<Record<'name' | 'status', string | undefined>>;
    saving: boolean;
    formError: string | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    (e: 'update:name', value: string): void;
    (e: 'update:status', value: ProjectApiStatus): void;
    (e: 'close'): void;
    (e: 'submit'): void;
}>();

// Proxies que pasan hacia arriba
const nameProxy = computed({
    get: () => props.name,
    set: (v: string) => emit('update:name', v),
});

const statusProxy = computed({
    get: () => props.status,
    set: (v: ProjectApiStatus) => emit('update:status', v),
});

</script>