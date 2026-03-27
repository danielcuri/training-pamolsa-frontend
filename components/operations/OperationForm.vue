<template>
    <form class="space-y-4" @submit.prevent="emit('submit')">
        <!-- Proyecto (primer select anidado) -->
        <div>
            <label for="operation-project">Proyecto</label>
            <select id="operation-project" v-model="selectedProjectIdProxy" class="form-select"
                :class="{ 'border-red-500': errors?.areaId && !selectedProjectId }"
                :disabled="saving || loadingAreas || mode === 'edit'">
                <option value="">Selecciona un proyecto</option>
                <option v-for="project in projects" :key="project.id" :value="project.id">
                    {{ project.name }}
                </option>
            </select>
            <p v-if="loadingAreas" class="mt-1 text-xs text-blue-500">
                Cargando áreas...
            </p>
        </div>

        <!-- Área (segundo select anidado, depende del proyecto) -->
        <div>
            <label for="operation-area">Área</label>
            <select id="operation-area" v-model="areaIdProxy" v-bind="areaIdAttrs" class="form-select"
                :class="{ 'border-red-500': errors?.areaId }"
                :disabled="saving || !selectedProjectId || availableAreas.length === 0 || mode === 'edit'">
                <option value="">
                    {{ !selectedProjectId ? 'Primero selecciona un proyecto' : 'Selecciona un área' }}
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

        <!-- Name -->
        <div>
            <label for="operation-name">Nombre</label>
            <input id="operation-name" v-model="nameProxy" v-bind="nameAttrs" type="text" class="form-input"
                :class="{ 'border-red-500': errors?.name }" :disabled="saving" placeholder="Nombre de la operación" />
            <p v-if="errors?.name" class="mt-1 text-xs text-red-500">
                {{ errors.name }}
            </p>
        </div>

        <!-- Description -->
        <div>
            <label for="operation-description">Descripción</label>
            <textarea id="operation-description" v-model="descriptionProxy" v-bind="descriptionAttrs"
                class="form-textarea" :class="{ 'border-red-500': errors?.description }" :disabled="saving"
                placeholder="Descripción de la operación (opcional)" rows="3"></textarea>
            <p v-if="errors?.description" class="mt-1 text-xs text-red-500">
                {{ errors.description }}
            </p>
        </div>

        <!-- Priority -->
        <div>
            <label for="operation-priority">Prioridad</label>
            <select id="operation-priority" v-model="priorityProxy" v-bind="priorityAttrs" class="form-select"
                :class="{ 'border-red-500': errors?.priority }" :disabled="saving">
                <option value="CRITICAL">Crítica</option>
                <option value="SEMI_CRITICAL">Semi-crítica</option>
                <option value="NON_CRITICAL">No crítica</option>
            </select>
            <p v-if="errors?.priority" class="mt-1 text-xs text-red-500">
                {{ errors.priority }}
            </p>
        </div>

        <!-- Weight Percent -->
        <div>
            <label for="operation-weight">Peso (%)</label>
            <input id="operation-weight" v-model.number="weightPercentProxy" v-bind="weightPercentAttrs" type="number"
                min="0" max="100" class="form-input" :class="{ 'border-red-500': errors?.weightPercent }"
                :disabled="saving" placeholder="0-100" />
            <p v-if="errors?.weightPercent" class="mt-1 text-xs text-red-500">
                {{ errors.weightPercent }}
            </p>
        </div>

        <!-- Status -->
        <div>
            <label for="operation-status">Estado</label>
            <select id="operation-status" v-model="statusProxy" v-bind="statusAttrs" class="form-select"
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

        <!-- Botones -->
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
import { computed, watch } from 'vue';
import type { BaseFieldProps, GenericObject } from 'vee-validate';
import type { OperationStatus, OperationPriority, AreaMinimal } from '~/types/operation';
import type { Project } from '~/types/project';

interface Props {
    name: string | undefined;
    nameAttrs: BaseFieldProps & GenericObject;
    description: string | undefined;
    descriptionAttrs: BaseFieldProps & GenericObject;
    priority: OperationPriority | undefined;
    priorityAttrs: BaseFieldProps & GenericObject;
    weightPercent: number | undefined;
    weightPercentAttrs: BaseFieldProps & GenericObject;
    status: OperationStatus | undefined;
    statusAttrs: BaseFieldProps & GenericObject;
    areaId: string | undefined;
    areaIdAttrs: BaseFieldProps & GenericObject;
    errors: Partial<Record<'name' | 'description' | 'priority' | 'weightPercent' | 'status' | 'areaId', string | undefined>>;
    saving: boolean;
    formError: string | null;
    mode: 'create' | 'edit';
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
    (e: 'submit'): void;
    (e: 'cancel'): void;
}>();

// Proxies para v-model
const nameProxy = computed({
    get: () => props.name ?? '',
    set: (v: string) => emit('update:name', v),
});

const descriptionProxy = computed({
    get: () => props.description ?? '',
    set: (v: string) => emit('update:description', v),
});

const priorityProxy = computed({
    get: () => props.priority ?? 'CRITICAL',
    set: (v: string) => emit('update:priority', v as OperationPriority),
});

const weightPercentProxy = computed({
    get: () => props.weightPercent,
    set: (v: number | undefined) => emit('update:weightPercent', v),
});

const statusProxy = computed({
    get: () => props.status ?? 'ACTIVE',
    set: (v: string) => emit('update:status', v as OperationStatus),
});

const areaIdProxy = computed({
    get: () => props.areaId ?? '',
    set: (v: string) => emit('update:areaId', v),
});

// Proxy para el proyecto seleccionado (controla el select anidado)
const selectedProjectIdProxy = computed({
    get: () => props.selectedProjectId,
    set: (v: string) => emit('update:selectedProjectId', v),
});
</script>