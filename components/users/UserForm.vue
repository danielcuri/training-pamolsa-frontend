<template>
    <form class="space-y-4" @submit.prevent="emit('submit')">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
                <label for="user-name">Nombre</label>
                <input id="user-name" v-model="nameProxy" v-bind="nameAttrs" type="text" class="form-input"
                    :class="{ 'border-red-500': errors?.name }" :disabled="saving" placeholder="Nombre completo" />
                <p v-if="errors?.name" class="mt-1 text-xs text-red-500">
                    {{ errors.name }}
                </p>
            </div>

            <div>
                <label for="user-email">Correo</label>
                <input id="user-email" v-model="emailProxy" v-bind="emailAttrs" type="email" class="form-input"
                    :class="{ 'border-red-500': errors?.email }" :disabled="saving" placeholder="correo@empresa.com" />
                <p v-if="errors?.email" class="mt-1 text-xs text-red-500">
                    {{ errors.email }}
                </p>
            </div>

            <div>
                <label for="user-dni">DNI</label>
                <input id="user-dni" v-model="dniProxy" v-bind="dniAttrs" type="text" class="form-input"
                    :class="{ 'border-red-500': errors?.dni }" :disabled="saving" placeholder="Documento de identidad"
                    maxlength="8" inputmode="numeric" pattern="[0-9]{8}" />
                <p v-if="errors?.dni" class="mt-1 text-xs text-red-500">
                    {{ errors.dni }}
                </p>
            </div>

            <div>
                <label for="user-password">
                    {{ mode === 'create' ? 'Contraseña' : 'Contraseña nueva' }}
                </label>
                <input id="user-password" v-model="passwordProxy" v-bind="passwordAttrs" type="password" class="form-input"
                    :class="{ 'border-red-500': errors?.password }" :disabled="saving"
                    :placeholder="mode === 'create' ? 'Mínimo 6 caracteres' : 'Déjalo vacío para mantener la actual'" />
                <p v-if="errors?.password" class="mt-1 text-xs text-red-500">
                    {{ errors.password }}
                </p>
            </div>

            <div>
                <label for="user-education-level">Nivel de educación</label>
                <input id="user-education-level" v-model="educationLevelProxy" v-bind="educationLevelAttrs" type="text"
                    class="form-input" :class="{ 'border-red-500': errors?.educationLevel }" :disabled="saving"
                    placeholder="Ej. Universitario" />
                <p v-if="errors?.educationLevel" class="mt-1 text-xs text-red-500">
                    {{ errors.educationLevel }}
                </p>
            </div>

            <div>
                <label for="user-hire-date">Fecha de ingreso</label>
                <input id="user-hire-date" v-model="hireDateProxy" v-bind="hireDateAttrs" type="date" class="form-input"
                    :class="{ 'border-red-500': errors?.hireDate }" :disabled="saving" />
                <p v-if="errors?.hireDate" class="mt-1 text-xs text-red-500">
                    {{ errors.hireDate }}
                </p>
            </div>

            <div>
                <label for="user-role">Rol</label>
                <select id="user-role" v-model="roleProxy" v-bind="roleAttrs" class="form-select"
                    :class="{ 'border-red-500': errors?.role }" :disabled="saving">
                    <option value="COLLABORATOR">Colaborador</option>
                    <option value="ADMIN">Admin</option>
                    <option value="SUPERVISOR">Supervisor</option>
                </select>
                <p v-if="errors?.role" class="mt-1 text-xs text-red-500">
                    {{ errors.role }}
                </p>
            </div>

            <div>
                <label for="user-status">Estado</label>
                <select id="user-status" v-model="statusProxy" v-bind="statusAttrs" class="form-select"
                    :class="{ 'border-red-500': errors?.status }" :disabled="saving">
                    <option value="ACTIVE">Activo</option>
                    <option value="INACTIVE">Inactivo</option>
                </select>
                <p v-if="errors?.status" class="mt-1 text-xs text-red-500">
                    {{ errors.status }}
                </p>
            </div>

            <div>
                <label for="user-project">Proyecto</label>
                <select id="user-project" v-model="selectedProjectIdProxy" class="form-select"
                    :disabled="saving || loadingAreas">
                    <option value="">Sin proyecto</option>
                    <option v-for="project in projects" :key="project.id" :value="project.id">
                        {{ project.name }}
                    </option>
                </select>
                <p v-if="loadingAreas" class="mt-1 text-xs text-blue-500">
                    Cargando áreas...
                </p>
            </div>

            <div>
                <label for="user-area">Área</label>
                <select id="user-area" v-model="areaIdProxy" v-bind="areaIdAttrs" class="form-select"
                    :class="{ 'border-red-500': errors?.areaId }"
                    :disabled="saving || !selectedProjectId || loadingAreas || availableAreas.length === 0">
                    <option value="">
                        {{ !selectedProjectId ? 'Primero selecciona un proyecto' : 'Sin área' }}
                    </option>
                    <option v-for="area in availableAreas" :key="area.id" :value="area.id">
                        {{ area.name }}
                    </option>
                </select>
                <p v-if="errors?.areaId" class="mt-1 text-xs text-red-500">
                    {{ errors.areaId }}
                </p>
                <p v-else-if="selectedProjectId && availableAreas.length === 0 && !loadingAreas"
                    class="mt-1 text-xs text-yellow-500">
                    No hay áreas activas para este proyecto
                </p>
            </div>
        </div>

        <div v-if="formError" class="rounded bg-red-50 p-3 text-sm text-red-600">
            {{ formError }}
        </div>

        <div class="flex flex-wrap items-center justify-end gap-2">
            <slot name="actions">
                <button type="button" class="btn btn-outline-primary" :disabled="saving" @click="emit('cancel')">
                    Cancelar
                </button>
                <button type="submit" class="btn btn-primary" :disabled="saving || loadingAreas">
                    <span v-if="saving">Guardando...</span>
                    <span v-else>Guardar</span>
                </button>
            </slot>
        </div>
    </form>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { BaseFieldProps, GenericObject } from 'vee-validate';
import type { AreaMinimal } from '~/types/operation';
import type { Project } from '~/types/project';
import type { UserRole, UserStatus } from '~/types/user';

interface Props {
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
    (e: 'submit'): void;
    (e: 'cancel'): void;
}>();

const nameProxy = computed({
    get: () => props.name ?? '',
    set: (v: string) => emit('update:name', v),
});

const emailProxy = computed({
    get: () => props.email ?? '',
    set: (v: string) => emit('update:email', v),
});

const dniProxy = computed({
    get: () => props.dni ?? '',
    set: (v: string) => emit('update:dni', v),
});

const passwordProxy = computed({
    get: () => props.password ?? '',
    set: (v: string) => emit('update:password', v),
});

const educationLevelProxy = computed({
    get: () => props.educationLevel ?? '',
    set: (v: string) => emit('update:educationLevel', v),
});

const hireDateProxy = computed({
    get: () => props.hireDate ?? '',
    set: (v: string) => emit('update:hireDate', v),
});

const roleProxy = computed({
    get: () => props.role ?? 'COLLABORATOR',
    set: (v: string) => emit('update:role', v as UserRole),
});

const statusProxy = computed({
    get: () => props.status ?? 'ACTIVE',
    set: (v: string) => emit('update:status', v as UserStatus),
});

const areaIdProxy = computed({
    get: () => props.areaId ?? '',
    set: (v: string) => emit('update:areaId', v),
});

const selectedProjectIdProxy = computed({
    get: () => props.selectedProjectId,
    set: (v: string) => emit('update:selectedProjectId', v),
});
</script>
