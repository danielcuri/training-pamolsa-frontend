<template>
    <form class="space-y-4" @submit.prevent="emit('submit')">
        <!-- Name -->
        <div>
            <label for="project-name">Name</label>
            <input id="project-name" v-model="nameProxy" v-bind="nameAttrs" type="text" class="form-input"
                :class="{ 'border-red-500': errors?.name }" :disabled="saving" placeholder="Nombre del proyecto" />
            <p v-if="errors?.name" class="mt-1 text-xs text-red-500">
                {{ errors.name }}
            </p>
        </div>

        <!-- Status -->
        <div>
            <label for="project-status">Status</label>
            <select id="project-status" v-model="statusProxy" v-bind="statusAttrs" class="form-select"
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
import type { ProjectApiStatus } from '~/types/project';

interface Props {
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
    (e: 'submit'): void;
    (e: 'cancel'): void;  // Nuevo evento para cancelar
}>();

// Proxies para v-model
const nameProxy = computed({
    get: () => props.name ?? '',
    set: (v: string) => emit('update:name', v),
});

const statusProxy = computed({
    get: () => props.status ?? 'ACTIVE',
    set: (v: string) => emit('update:status', v as ProjectApiStatus),
});
</script>