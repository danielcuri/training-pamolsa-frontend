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
                            class="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                            <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900">
                                {{ mode === 'create' ? 'Crear usuario' : 'Editar usuario' }}
                            </DialogTitle>

                            <div class="mt-5">
                                <UserForm v-model:name="nameProxy" v-model:email="emailProxy" v-model:dni="dniProxy"
                                    v-model:password="passwordProxy" v-model:education-level="educationLevelProxy"
                                    v-model:hire-date="hireDateProxy" v-model:role="roleProxy" v-model:status="statusProxy"
                                    v-model:area-id="areaIdProxy" v-model:selected-project-id="selectedProjectIdProxy"
                                    :mode="mode" :name-attrs="nameAttrs" :email-attrs="emailAttrs" :dni-attrs="dniAttrs"
                                    :password-attrs="passwordAttrs" :education-level-attrs="educationLevelAttrs"
                                    :hire-date-attrs="hireDateAttrs" :role-attrs="roleAttrs" :status-attrs="statusAttrs"
                                    :area-id-attrs="areaIdAttrs" :errors="errors" :saving="saving"
                                    :form-error="formError" :projects="projects" :available-areas="availableAreas"
                                    :loading-areas="loadingAreas"
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

import UserForm from './UserForm.vue';
import type { AreaMinimal } from '~/types/operation';
import type { Project } from '~/types/project';
import type { UserRole, UserStatus } from '~/types/user';

interface Props {
    isOpen: boolean;
    mode: 'create' | 'edit';
    name: string | undefined;
    nameAttrs: BaseFieldProps & GenericObject;
    email: string | undefined;
    emailAttrs: BaseFieldProps & GenericObject;
    dni: string | undefined;
    dniAttrs: BaseFieldProps & GenericObject;
    password: string | undefined;
    passwordAttrs: BaseFieldProps & GenericObject;
    educationLevel: string | undefined;
    educationLevelAttrs: BaseFieldProps & GenericObject;
    hireDate: string | undefined;
    hireDateAttrs: BaseFieldProps & GenericObject;
    role: UserRole | undefined;
    roleAttrs: BaseFieldProps & GenericObject;
    status: UserStatus | undefined;
    statusAttrs: BaseFieldProps & GenericObject;
    areaId: string | undefined;
    areaIdAttrs: BaseFieldProps & GenericObject;
    errors: Partial<Record<'name' | 'email' | 'dni' | 'password' | 'educationLevel' | 'hireDate' | 'role' | 'status' | 'projectId' | 'areaId', string | undefined>>;
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
    (e: 'update:email', value: string): void;
    (e: 'update:dni', value: string): void;
    (e: 'update:password', value: string): void;
    (e: 'update:educationLevel', value: string): void;
    (e: 'update:hireDate', value: string): void;
    (e: 'update:role', value: UserRole): void;
    (e: 'update:status', value: UserStatus): void;
    (e: 'update:areaId', value: string): void;
    (e: 'update:selectedProjectId', value: string): void;
    (e: 'close'): void;
    (e: 'submit'): void;
}>();

const nameProxy = computed({
    get: () => props.name,
    set: (v: string) => emit('update:name', v),
});

const emailProxy = computed({
    get: () => props.email,
    set: (v: string) => emit('update:email', v),
});

const dniProxy = computed({
    get: () => props.dni,
    set: (v: string) => emit('update:dni', v),
});

const passwordProxy = computed({
    get: () => props.password,
    set: (v: string) => emit('update:password', v),
});

const educationLevelProxy = computed({
    get: () => props.educationLevel,
    set: (v: string) => emit('update:educationLevel', v),
});

const hireDateProxy = computed({
    get: () => props.hireDate,
    set: (v: string) => emit('update:hireDate', v),
});

const roleProxy = computed({
    get: () => props.role,
    set: (v: UserRole) => emit('update:role', v),
});

const statusProxy = computed({
    get: () => props.status,
    set: (v: UserStatus) => emit('update:status', v),
});

const areaIdProxy = computed({
    get: () => props.areaId,
    set: (v: string) => emit('update:areaId', v),
});

const selectedProjectIdProxy = computed({
    get: () => props.selectedProjectId,
    set: (v: string) => emit('update:selectedProjectId', v),
});
</script>
