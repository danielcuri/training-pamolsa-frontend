<template>
    <form class="space-y-4" @submit.prevent="emit('submit')">
        <div class="rounded bg-gray-50 p-3 text-xs text-gray-600">
            Proyecto: {{ templateProjectName || '-' }}
            <br>
            Area: {{ templateAreaName || '-' }}
        </div>

        <div>
            <label for="template-operation-operation">Operacion</label>
            <select id="template-operation-operation" v-model="areaOperationIdProxy" v-bind="areaOperationIdAttrs" class="form-select"
                :class="{ 'border-red-500': errors?.areaOperationId }" :disabled="saving || loadingOperationOptions || operationOptions.length === 0"
                @change="emit('selectOperation', areaOperationIdProxy)">
                <option value="">Selecciona una operacion</option>
                <option v-for="operation in operationOptions" :key="operation.id" :value="operation.id">
                    {{ operation.name }}
                </option>
            </select>
            <p v-if="errors?.areaOperationId" class="mt-1 text-xs text-red-500">
                {{ errors.areaOperationId }}
            </p>
            <p v-else-if="loadingOperationOptions" class="mt-1 text-xs text-blue-500">
                Cargando operaciones...
            </p>
            <p v-else-if="operationOptions.length === 0" class="mt-1 text-xs text-yellow-500">
                No hay operaciones activas para el proyecto y area de este template
            </p>
        </div>

        <div>
            <label for="template-operation-name">Nombre</label>
            <input id="template-operation-name" v-model="nameProxy" v-bind="nameAttrs" type="text" class="form-input"
                :class="{ 'border-red-500': errors?.name }" :disabled="saving" placeholder="Nombre de la operacion" />
            <p v-if="errors?.name" class="mt-1 text-xs text-red-500">
                {{ errors.name }}
            </p>
        </div>

        <div>
            <label for="template-operation-code">Codigo</label>
            <input id="template-operation-code" v-model="codeProxy" v-bind="codeAttrs" type="text" class="form-input"
                :class="{ 'border-red-500': errors?.code }" :disabled="saving" placeholder="Codigo de la operacion" />
            <p v-if="errors?.code" class="mt-1 text-xs text-red-500">
                {{ errors.code }}
            </p>
        </div>

        <div>
            <label for="template-operation-description">Descripcion</label>
            <textarea id="template-operation-description" v-model="descriptionProxy" v-bind="descriptionAttrs"
                class="form-textarea" :class="{ 'border-red-500': errors?.description }" :disabled="saving"
                placeholder="Descripcion de la operacion" rows="3"></textarea>
            <p v-if="errors?.description" class="mt-1 text-xs text-red-500">
                {{ errors.description }}
            </p>
        </div>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
                <label for="template-operation-priority">Prioridad</label>
                <select id="template-operation-priority" v-model="priorityProxy" v-bind="priorityAttrs" class="form-select"
                    :class="{ 'border-red-500': errors?.priority }" :disabled="saving">
                    <option value="CRITICAL">Critica</option>
                    <option value="SEMI_CRITICAL">Semi-critica</option>
                    <option value="NON_CRITICAL">No critica</option>
                </select>
                <p v-if="errors?.priority" class="mt-1 text-xs text-red-500">
                    {{ errors.priority }}
                </p>
            </div>

            <div>
                <label for="template-operation-weight">Peso (%)</label>
                <input id="template-operation-weight" v-model.number="weightPercentProxy" v-bind="weightPercentAttrs" type="number"
                    min="0" max="100" class="form-input" :class="{ 'border-red-500': errors?.weightPercent }"
                    :disabled="saving" placeholder="0-100" />
                <p v-if="errors?.weightPercent" class="mt-1 text-xs text-red-500">
                    {{ errors.weightPercent }}
                </p>
            </div>

            <div>
                <label for="template-operation-order">Orden</label>
                <input id="template-operation-order" v-model.number="orderProxy" v-bind="orderAttrs" type="number" min="0"
                    class="form-input" :class="{ 'border-red-500': errors?.order }" :disabled="saving" placeholder="0" />
                <p v-if="errors?.order" class="mt-1 text-xs text-red-500">
                    {{ errors.order }}
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
                <button type="submit" class="btn btn-primary" :disabled="saving || loadingOperationOptions">
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
import type { Operation, OperationPriority } from '~/types/operation';

interface Props {
    name: string | undefined;
    nameAttrs: BaseFieldProps & GenericObject;
    code: string | undefined;
    codeAttrs: BaseFieldProps & GenericObject;
    description: string | undefined;
    descriptionAttrs: BaseFieldProps & GenericObject;
    priority: OperationPriority | undefined;
    priorityAttrs: BaseFieldProps & GenericObject;
    weightPercent: number | undefined;
    weightPercentAttrs: BaseFieldProps & GenericObject;
    order: number | undefined;
    orderAttrs: BaseFieldProps & GenericObject;
    areaOperationId: string | undefined;
    areaOperationIdAttrs: BaseFieldProps & GenericObject;
    errors: Partial<
        Record<'name' | 'code' | 'description' | 'priority' | 'weightPercent' | 'order' | 'areaOperationId', string | undefined>
    >;
    saving: boolean;
    formError: string | null;
    operationOptions: Operation[];
    loadingOperationOptions: boolean;
    templateProjectName?: string;
    templateAreaName?: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    (e: 'update:name', value: string): void;
    (e: 'update:code', value: string): void;
    (e: 'update:description', value: string): void;
    (e: 'update:priority', value: OperationPriority): void;
    (e: 'update:weightPercent', value: number | undefined): void;
    (e: 'update:order', value: number | undefined): void;
    (e: 'update:areaOperationId', value: string): void;
    (e: 'selectOperation', value: string): void;
    (e: 'submit'): void;
    (e: 'cancel'): void;
}>();

const nameProxy = computed({
    get: () => props.name ?? '',
    set: (value: string) => emit('update:name', value),
});

const codeProxy = computed({
    get: () => props.code ?? '',
    set: (value: string) => emit('update:code', value),
});

const descriptionProxy = computed({
    get: () => props.description ?? '',
    set: (value: string) => emit('update:description', value),
});

const priorityProxy = computed({
    get: () => props.priority ?? 'CRITICAL',
    set: (value: string) => emit('update:priority', value as OperationPriority),
});

const weightPercentProxy = computed({
    get: () => props.weightPercent,
    set: (value: number | undefined) => emit('update:weightPercent', value),
});

const orderProxy = computed({
    get: () => props.order,
    set: (value: number | undefined) => emit('update:order', value),
});

const areaOperationIdProxy = computed({
    get: () => props.areaOperationId ?? '',
    set: (value: string) => emit('update:areaOperationId', value),
});
</script>
