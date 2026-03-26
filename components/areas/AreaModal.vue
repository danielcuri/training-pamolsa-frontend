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
                                {{ mode === 'create' ? 'Crear área' : 'Editar área' }}
                            </DialogTitle>

                            <div class="mt-5">
                                <AreaForm v-model:name="nameProxy" v-model:status="statusProxy"
                                    v-model:project-id="projectIdProxy" :name-attrs="nameAttrs"
                                    :status-attrs="statusAttrs" :project-id-attrs="projectIdAttrs" :errors="errors"
                                    :saving="saving" :form-error="formError" :mode="mode" :projects="projects"
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
import AreaForm from './AreaForm.vue';
import type { BaseFieldProps, GenericObject } from 'vee-validate';
import type { AreaApiStatus } from '~/types/area';
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
    status: AreaApiStatus | undefined;
    statusAttrs: BaseFieldProps & GenericObject;
    projectId: string | undefined;                    // ← NUEVO
    projectIdAttrs: BaseFieldProps & GenericObject;   // ← NUEVO
    errors: Partial<Record<'name' | 'status' | 'projectId', string | undefined>>; // ← Agregado projectId
    saving: boolean;
    formError: string | null;
    projects: Project[];                              // ← NUEVO (para el select de proyectos)
}

const props = defineProps<Props>();

const emit = defineEmits<{
    (e: 'update:name', value: string): void;
    (e: 'update:status', value: AreaApiStatus): void;
    (e: 'update:projectId', value: string): void;    // ← NUEVO
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
    set: (v: AreaApiStatus) => emit('update:status', v),
});

// ← NUEVO: Proxy para projectId
const projectIdProxy = computed({
    get: () => props.projectId,
    set: (v: string) => emit('update:projectId', v),
});
</script>