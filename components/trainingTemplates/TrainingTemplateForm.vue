<template>
    <form class="space-y-4" @submit.prevent="emit('submit')">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
                <label for="training-template-project">Proyecto</label>
                <select id="training-template-project" v-model="selectedProjectIdProxy" class="form-select"
                    :class="{ 'border-red-500': errors?.projectId }" :disabled="saving || loadingAreas">
                    <option value="">Selecciona un proyecto</option>
                    <option v-for="project in projects" :key="project.id" :value="project.id">
                        {{ project.name }}
                    </option>
                </select>
                <p v-if="errors?.projectId" class="mt-1 text-xs text-red-500">
                    {{ errors.projectId }}
                </p>
            </div>

            <div>
                <label for="training-template-area">Área</label>
                <select id="training-template-area" v-model="areaIdProxy" v-bind="areaIdAttrs" class="form-select"
                    :class="{ 'border-red-500': errors?.areaId }"
                    :disabled="saving || !selectedProjectId || loadingAreas || availableAreas.length === 0">
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
                    class="mt-1 text-xs text-yellow-600">
                    No hay áreas activas para este proyecto
                </p>
            </div>

            <div class="md:col-span-2">
                <label for="training-template-name">Nombre</label>
                <input id="training-template-name" v-model="nameProxy" v-bind="nameAttrs" type="text" class="form-input"
                    :class="{ 'border-red-500': errors?.name }" :disabled="saving" placeholder="Nombre del template" />
                <p v-if="errors?.name" class="mt-1 text-xs text-red-500">
                    {{ errors.name }}
                </p>
            </div>

            <div>
                <label for="training-template-version">Versión</label>
                <input id="training-template-version" v-model="versionProxy" v-bind="versionAttrs" type="number"
                    min="1" step="1" class="form-input" :class="{ 'border-red-500': errors?.version }" :disabled="saving"
                    placeholder="1" />
                <p v-if="errors?.version" class="mt-1 text-xs text-red-500">
                    {{ errors.version }}
                </p>
            </div>

            <div>
                <label for="training-template-minimum-score">Nota mínima</label>
                <input id="training-template-minimum-score" v-model="minimumPassingScoreProxy"
                    v-bind="minimumPassingScoreAttrs" type="number" min="0" step="0.01" class="form-input"
                    :class="{ 'border-red-500': errors?.minimumPassingScore }" :disabled="saving" placeholder="0" />
                <p v-if="errors?.minimumPassingScore" class="mt-1 text-xs text-red-500">
                    {{ errors.minimumPassingScore }}
                </p>
            </div>

            <div>
                <label for="training-template-period-duration">Duración del período (días)</label>
                <input id="training-template-period-duration" v-model="periodDurationDaysProxy"
                    v-bind="periodDurationDaysAttrs" type="number" min="1" step="1" class="form-input"
                    :class="{ 'border-red-500': errors?.periodDurationDays }" :disabled="saving" placeholder="1" />
                <p v-if="errors?.periodDurationDays" class="mt-1 text-xs text-red-500">
                    {{ errors.periodDurationDays }}
                </p>
            </div>

            <div>
                <label for="training-template-total-periods">Total de períodos</label>
                <input id="training-template-total-periods" v-model="totalPeriodsProxy" v-bind="totalPeriodsAttrs"
                    type="number" min="1" step="1" class="form-input" :class="{ 'border-red-500': errors?.totalPeriods }"
                    :disabled="saving" placeholder="1" />
                <p v-if="errors?.totalPeriods" class="mt-1 text-xs text-red-500">
                    {{ errors.totalPeriods }}
                </p>
            </div>

            <div class="md:col-span-2">
                <label for="training-template-pdf">Plantilla PDF</label>
                <input id="training-template-pdf" v-model="certificateTemplatePdfProxy" v-bind="certificateTemplatePdfAttrs"
                    type="text" class="form-input" :class="{ 'border-red-500': errors?.certificateTemplatePdf }"
                    :disabled="saving" placeholder="Ruta, nombre o identificador del PDF" />
                <p v-if="errors?.certificateTemplatePdf" class="mt-1 text-xs text-red-500">
                    {{ errors.certificateTemplatePdf }}
                </p>
                <p v-else class="mt-1 text-xs text-gray-500">
                    Por ahora este campo guarda una referencia textual. El upload real del PDF se puede conectar después.
                </p>
            </div>

            <div>
                <label for="training-template-status">Estado</label>
                <select id="training-template-status" v-model="statusProxy" v-bind="statusAttrs" class="form-select"
                    :class="{ 'border-red-500': errors?.status }" :disabled="saving">
                    <option value="ACTIVE">Activo</option>
                    <option value="INACTIVE">Inactivo</option>
                </select>
                <p v-if="errors?.status" class="mt-1 text-xs text-red-500">
                    {{ errors.status }}
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
import type { TrainingTemplateStatus } from '~/types/trainingTemplate';

interface Props {
    name: string | undefined;
    nameAttrs: BaseFieldProps & GenericObject;
    version: string | number | undefined;
    versionAttrs: BaseFieldProps & GenericObject;
    periodDurationDays: string | number | undefined;
    periodDurationDaysAttrs: BaseFieldProps & GenericObject;
    totalPeriods: string | number | undefined;
    totalPeriodsAttrs: BaseFieldProps & GenericObject;
    minimumPassingScore: string | number | undefined;
    minimumPassingScoreAttrs: BaseFieldProps & GenericObject;
    certificateTemplatePdf: string | undefined;
    certificateTemplatePdfAttrs: BaseFieldProps & GenericObject;
    status: TrainingTemplateStatus | undefined;
    statusAttrs: BaseFieldProps & GenericObject;
    areaId: string | undefined;
    areaIdAttrs: BaseFieldProps & GenericObject;
    errors: Partial<
        Record<
            | 'name'
            | 'version'
            | 'periodDurationDays'
            | 'totalPeriods'
            | 'minimumPassingScore'
            | 'certificateTemplatePdf'
            | 'status'
            | 'projectId'
            | 'areaId',
            string | undefined
        >
    >;
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
    (e: 'update:version', value: string): void;
    (e: 'update:periodDurationDays', value: string): void;
    (e: 'update:totalPeriods', value: string): void;
    (e: 'update:minimumPassingScore', value: string): void;
    (e: 'update:certificateTemplatePdf', value: string): void;
    (e: 'update:status', value: TrainingTemplateStatus): void;
    (e: 'update:areaId', value: string): void;
    (e: 'update:selectedProjectId', value: string): void;
    (e: 'submit'): void;
    (e: 'cancel'): void;
}>();

const nameProxy = computed({
    get: () => props.name ?? '',
    set: (value: string) => emit('update:name', value),
});

const versionProxy = computed({
    get: () => String(props.version ?? ''),
    set: (value: string) => emit('update:version', value),
});

const periodDurationDaysProxy = computed({
    get: () => String(props.periodDurationDays ?? ''),
    set: (value: string) => emit('update:periodDurationDays', value),
});

const totalPeriodsProxy = computed({
    get: () => String(props.totalPeriods ?? ''),
    set: (value: string) => emit('update:totalPeriods', value),
});

const minimumPassingScoreProxy = computed({
    get: () => String(props.minimumPassingScore ?? ''),
    set: (value: string) => emit('update:minimumPassingScore', value),
});

const certificateTemplatePdfProxy = computed({
    get: () => props.certificateTemplatePdf ?? '',
    set: (value: string) => emit('update:certificateTemplatePdf', value),
});

const statusProxy = computed({
    get: () => props.status ?? 'ACTIVE',
    set: (value: string) => emit('update:status', value as TrainingTemplateStatus),
});

const areaIdProxy = computed({
    get: () => props.areaId ?? '',
    set: (value: string) => emit('update:areaId', value),
});

const selectedProjectIdProxy = computed({
    get: () => props.selectedProjectId,
    set: (value: string) => emit('update:selectedProjectId', value),
});
</script>
