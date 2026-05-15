<template>
    <form class="space-y-4" @submit.prevent="emit('submit')">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
                <label for="training-project">Proyecto</label>
                <select id="training-project" v-model="selectedProjectIdProxy" class="form-select" :disabled="saving">
                    <option value="">Selecciona un proyecto</option>
                    <option v-for="project in projects" :key="project.id" :value="project.id">
                        {{ project.name }}
                    </option>
                </select>
            </div>

            <div>
                <label for="training-area">Área</label>
                <select id="training-area" v-model="selectedAreaIdProxy" class="form-select" :disabled="saving || loadingAreas || !selectedProjectIdProxy">
                    <option value="">{{ !selectedProjectIdProxy ? 'Primero selecciona un proyecto' : 'Selecciona un área' }}</option>
                    <option v-for="area in availableAreas" :key="area.id" :value="area.id">
                        {{ area.name }}
                    </option>
                </select>
            </div>

            <div>
                <label for="training-user">Usuario</label>
                <select id="training-user" v-model="userIdProxy" v-bind="userIdAttrs" class="form-select" :class="{ 'border-red-500': errors?.userId }" :disabled="saving || !selectedAreaIdProxy">
                    <option value="">Selecciona un usuario</option>
                    <option v-for="user in users" :key="user.id" :value="user.id">
                        {{ user.name }}{{ user.email ? ` - ${user.email}` : '' }}
                    </option>
                </select>
                <p v-if="errors?.userId" class="mt-1 text-xs text-red-500">{{ errors.userId }}</p>
            </div>

            <div>
                <label for="training-template">Template</label>
                <select id="training-template" v-model="templateIdProxy" v-bind="templateIdAttrs" class="form-select" :class="{ 'border-red-500': errors?.templateId }" :disabled="saving || !selectedAreaIdProxy">
                    <option value="">Selecciona un template</option>
                    <option v-for="template in templates" :key="template.id" :value="template.id">
                        {{ template.name }}
                    </option>
                </select>
                <p v-if="errors?.templateId" class="mt-1 text-xs text-red-500">{{ errors.templateId }}</p>
            </div>

            <div>
                <label for="training-start-date">Fecha de inicio</label>
                <input
                    id="training-start-date"
                    v-model="startDateProxy"
                    v-bind="startDateAttrs"
                    type="date"
                    class="form-input"
                    :class="{ 'border-red-500': errors?.startDate }"
                    :disabled="saving"
                />
                <p v-if="errors?.startDate" class="mt-1 text-xs text-red-500">{{ errors.startDate }}</p>
            </div>

            <div>
                <label for="training-status">Estado</label>
                <select id="training-status" v-model="statusProxy" v-bind="statusAttrs" class="form-select" :class="{ 'border-red-500': errors?.status }" :disabled="saving">
                    <option v-for="option in statusOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
                </select>
                <p v-if="errors?.status" class="mt-1 text-xs text-red-500">{{ errors.status }}</p>
            </div>

            <div class="md:col-span-2">
                <label for="training-result">Resultado</label>
                <select id="training-result" v-model="resultProxy" v-bind="resultAttrs" class="form-select" :class="{ 'border-red-500': errors?.result }" :disabled="saving">
                    <option v-for="option in resultOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
                </select>
                <p v-if="errors?.result" class="mt-1 text-xs text-red-500">{{ errors.result }}</p>
            </div>
        </div>

        <div v-if="formError" class="rounded bg-red-50 p-3 text-sm text-red-600">
            {{ formError }}
        </div>

        <div class="flex flex-wrap items-center justify-end gap-2">
            <button type="button" class="btn btn-outline-primary" :disabled="saving" @click="emit('cancel')">
                Cancelar
            </button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
                <span v-if="saving">Guardando...</span>
                <span v-else>Guardar</span>
            </button>
        </div>
    </form>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { BaseFieldProps, GenericObject } from 'vee-validate';
import type { AreaMinimal } from '~/types/operation';
import type { Project } from '~/types/project';
import type { TrainingResult, TrainingStatus, TrainingTemplateOption, TrainingUserOption } from '~/types/training';

interface Props {
    selectedProjectId: string;
    selectedAreaId: string;
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
    projects: Project[];
    availableAreas: AreaMinimal[];
    loadingAreas: boolean;
    users: TrainingUserOption[];
    templates: TrainingTemplateOption[];
    statusOptions: Array<{ label: string; value: TrainingStatus }>;
    resultOptions: Array<{ label: string; value: TrainingResult }>;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    (e: 'update:selectedProjectId', value: string): void;
    (e: 'update:selectedAreaId', value: string): void;
    (e: 'update:userId', value: string): void;
    (e: 'update:templateId', value: string): void;
    (e: 'update:startDate', value: string): void;
    (e: 'update:status', value: TrainingStatus): void;
    (e: 'update:result', value: TrainingResult): void;
    (e: 'submit'): void;
    (e: 'cancel'): void;
}>();

const selectedProjectIdProxy = computed({
    get: () => props.selectedProjectId ?? '',
    set: (value: string) => emit('update:selectedProjectId', value),
});

const selectedAreaIdProxy = computed({
    get: () => props.selectedAreaId ?? '',
    set: (value: string) => emit('update:selectedAreaId', value),
});

const userIdProxy = computed({
    get: () => props.userId ?? '',
    set: (value: string) => emit('update:userId', value),
});

const templateIdProxy = computed({
    get: () => props.templateId ?? '',
    set: (value: string) => emit('update:templateId', value),
});

const startDateProxy = computed({
    get: () => props.startDate ?? '',
    set: (value: string) => emit('update:startDate', value),
});

const statusProxy = computed({
    get: () => props.status ?? 'NOT_STARTED',
    set: (value: string) => emit('update:status', value as TrainingStatus),
});

const resultProxy = computed({
    get: () => props.result ?? 'PASSED',
    set: (value: string) => emit('update:result', value as TrainingResult),
});
</script>
