<template>
    <form class="space-y-4" @submit.prevent="emit('submit')">
        <!-- Project -->
        <div>
            <label for="area-project">Proyecto</label>
            <select id="area-project" v-model="projectIdProxy" v-bind="projectIdAttrs" class="form-select"
                :class="{ 'border-red-500': errors?.projectId }" :disabled="saving || mode === 'edit'">
                <option value="">Selecciona un proyecto</option>
                <option v-for="project in projects" :key="project.id" :value="project.id">
                    {{ project.name }}
                </option>
            </select>
            <p v-if="errors?.projectId" class="mt-1 text-xs text-red-500">
                {{ errors.projectId }}
            </p>
        </div>

        <!-- Name -->
        <div>
            <label for="area-name">Name</label>
            <input id="area-name" v-model="nameProxy" v-bind="nameAttrs" type="text" class="form-input"
                :class="{ 'border-red-500': errors?.name }" :disabled="saving" placeholder="Nombre del área" />
            <p v-if="errors?.name" class="mt-1 text-xs text-red-500">
                {{ errors.name }}
            </p>
        </div>

        <!-- Status -->
        <div>
            <label for="area-status">Status</label>
            <select id="area-status" v-model="statusProxy" v-bind="statusAttrs" class="form-select"
                :class="{ 'border-red-500': errors?.status }" :disabled="saving">
                <option value="ACTIVE">Activo</option>
                <option value="INACTIVE">Inactivo</option>
            </select>
            <p v-if="errors?.status" class="mt-1 text-xs text-red-500">
                {{ errors.status }}
            </p>
        </div>

        <!-- Error general del API -->
        <div v-if="formError" class="rounded bg-red-50 p-3 text-sm text-red-600">
            {{ formError }}
        </div>

        <!-- Slot para botones personalizados (opcional) -->
        <div class="flex flex-wrap items-center justify-end gap-2">
            <slot name="actions">
                <!-- Default buttons si no se provee slot -->
                <button type="button" class="btn btn-outline-primary" :disabled="saving" @click="emit('cancel')">
                    Cancelar
                </button>
                <button type="submit" class="btn btn-primary" :disabled="saving">
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
import type { AreaApiStatus } from '~/types/area';
import type { Project } from '~/types/project';

interface Props {
    name: string | undefined;
    nameAttrs: BaseFieldProps & GenericObject;
    status: AreaApiStatus | undefined;
    statusAttrs: BaseFieldProps & GenericObject;
    projectId: string | undefined;           // ← NUEVO
    projectIdAttrs: BaseFieldProps & GenericObject;  // ← NUEVO
    errors: Partial<Record<'name' | 'status' | 'projectId', string | undefined>>;  // ← Agregado projectId
    saving: boolean;
    formError: string | null;
    mode: 'create' | 'edit';                 // ← NUEVO (para deshabilitar proyecto en edición)
    projects: Project[];                     // ← NUEVO (lista de proyectos para el select)
}

const props = defineProps<Props>();

const emit = defineEmits<{
    (e: 'update:name', value: string): void;
    (e: 'update:status', value: AreaApiStatus): void;
    (e: 'update:projectId', value: string): void;  // ← NUEVO
    (e: 'submit'): void;
    (e: 'cancel'): void;
}>();

// Proxies para v-model
const nameProxy = computed({
    get: () => props.name ?? '',
    set: (v: string) => emit('update:name', v),
});

const statusProxy = computed({
    get: () => props.status ?? 'ACTIVE',
    set: (v: string) => emit('update:status', v as AreaApiStatus),
});

// ← NUEVO: Proxy para projectId
const projectIdProxy = computed({
    get: () => props.projectId ?? '',
    set: (v: string) => emit('update:projectId', v),
});
</script>