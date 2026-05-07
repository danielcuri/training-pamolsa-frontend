<template>
    <div class="overflow-x-auto rounded-xl border border-slate-200 bg-[#fcfcfd] p-4 text-black shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
        <div class="min-w-[1120px] text-[12px]">
            <div class="rounded-t-lg bg-primary py-1 text-center text-sm font-bold tracking-wide text-white shadow-sm">
                ENTRENAMIENTO OPERATIVO
            </div>

            <div class="rounded-b-lg border border-t-0 border-slate-200 bg-white px-4 py-4">
                <div class="mb-4 flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                    <div class="min-w-[220px]">
                        <label class="mb-1 block text-sm font-semibold text-slate-700">Cantidad de meses</label>
                        <input
                            v-model="monthsInput"
                            type="number"
                            min="1"
                            max="24"
                            class="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/20"
                        />
                    </div>

                    <button
                        type="button"
                        class="h-10 rounded-md border border-primary bg-primary px-4 text-sm font-semibold text-white transition hover:brightness-105"
                        @click="generateMonths"
                    >
                        Generar vista
                    </button>
                </div>

                <p class="mb-4 text-[12px] font-semibold text-slate-700">
                    El ayudante debera obtener una calificacion minima de 5 en las 7 operaciones para que pueda solicitar su evaluacion final.
                </p>

                <div class="grid grid-cols-[190px_repeat(8,minmax(0,1fr))] items-start gap-x-12 gap-y-2">
                    <div class="pr-3 pt-1 text-right text-slate-700">Numero de la operacion</div>
                    <template v-for="operation in operationCards" :key="`${operation.id}-header`">
                        <div class="text-center font-bold text-slate-900">{{ operation.label }}</div>
                    </template>
                    <div></div>

                    <div class="pr-3 pt-2 text-right text-slate-700">Prioridad de la operacion:</div>
                    <template v-for="operation in operationCards" :key="`${operation.id}-priority`">
                        <div
                            class="rounded-t-md border border-slate-300 py-1 text-center font-bold shadow-[0_4px_12px_rgba(15,23,42,0.06)]"
                            :class="operation.priorityClass"
                        >
                            {{ operation.priorityLabel }}
                        </div>
                    </template>
                    <div></div>

                    <div class="pr-3 pt-2 text-right text-slate-700">Descripcion de la operacion:</div>
                    <template v-for="operation in operationCards" :key="`${operation.id}-description`">
                        <div class="-mt-px min-h-[102px] border border-slate-300 bg-slate-50 px-2 py-2 text-center text-[11px] leading-5 text-slate-800">
                            {{ operation.description }}
                        </div>
                    </template>
                    <div></div>

                    <div class="pr-3 pt-2 text-right text-slate-700">Cartilla asociada:</div>
                    <template v-for="operation in operationCards" :key="`${operation.id}-cartilla`">
                        <div class="rounded-b-md border border-slate-300 bg-white py-2 text-center font-semibold text-slate-700 shadow-[0_4px_12px_rgba(15,23,42,0.06)]">
                            {{ operation.cartilla }}
                        </div>
                    </template>
                    <div></div>
                </div>

                <div class="mt-4 space-y-4">
                    <div v-for="row in evaluationRows" :key="row.id">
                        <div class="grid grid-cols-[190px_repeat(8,minmax(0,1fr))] items-center gap-x-12">
                            <div class="rounded-md border border-slate-200 bg-[#e8eef7] px-3 py-2 text-center font-medium text-slate-700 underline shadow-[0_2px_6px_rgba(15,23,42,0.04)]">
                                {{ row.periodLabel }}
                            </div>

                            <template v-for="(score, scoreIndex) in row.scores" :key="`${row.id}-score-${scoreIndex}`">
                                <input
                                    v-model.number="row.scores[scoreIndex]"
                                    type="number"
                                    min="0"
                                    max="5"
                                    class="h-9 w-full rounded-sm border border-slate-300 bg-white px-2 text-center font-medium text-slate-800 shadow-[inset_0_1px_2px_rgba(15,23,42,0.05)] outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/20"
                                />
                            </template>

                            <button
                                type="button"
                                class="h-9 rounded-sm border border-primary bg-primary px-3 text-[11px] font-semibold text-white shadow-[0_6px_14px_rgba(67,97,238,0.22)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                                :disabled="row.uploading"
                                @click="uploadRow(row.id)"
                            >
                                <span v-if="row.uploading">Subiendo...</span>
                                <span v-else>Subir puntaje</span>
                            </button>
                        </div>

                        <div class="mt-3 grid grid-cols-[190px_1fr_1fr] items-stretch gap-x-12">
                            <div class="space-y-3">
                                <div class="flex items-center gap-2">
                                    <span class="min-w-[58px] font-semibold text-slate-700">Fecha:</span>
                                    <input
                                        v-model="row.date"
                                        type="date"
                                        class="w-full border-0 border-b border-slate-400 bg-transparent px-1 py-1 text-slate-800 outline-none transition focus:border-primary"
                                    />
                                </div>

                                <div class="flex items-center gap-2">
                                    <span class="min-w-[58px] font-semibold text-slate-700">Operador:</span>
                                    <input
                                        v-model="row.operator"
                                        type="text"
                                        class="w-full border-0 border-b border-slate-400 bg-transparent px-1 py-1 text-slate-800 outline-none transition focus:border-primary"
                                    />
                                </div>
                            </div>

                            <div class="rounded-sm border border-slate-300 bg-slate-50 p-2 shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
                                <span class="font-semibold text-slate-700">Validacion:</span>
                                <textarea
                                    v-model="row.validation"
                                    rows="2"
                                    class="mt-1 w-full resize-none border-0 bg-transparent p-0 text-[11px] text-slate-800 outline-none"
                                ></textarea>
                            </div>

                            <div class="rounded-sm border border-slate-300 bg-slate-50 p-2 shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
                                <span class="font-semibold text-slate-700">Que le falta reforzar?</span>
                                <textarea
                                    v-model="row.reinforcement"
                                    rows="2"
                                    class="mt-1 w-full resize-none border-0 bg-transparent p-0 text-[11px] text-slate-800 outline-none"
                                ></textarea>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div v-if="previewRow" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
        <div class="w-full max-w-3xl rounded-xl bg-white shadow-[0_20px_60px_rgba(15,23,42,0.25)]">
            <div class="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <div>
                    <h3 class="text-lg font-semibold text-slate-900">Confirmar subida de puntaje</h3>
                    <p class="text-sm text-slate-500">{{ previewRow.periodLabel }}</p>
                </div>

                <button type="button" class="text-sm font-medium text-slate-500 transition hover:text-slate-700" :disabled="previewRow.uploading" @click="closePreview">
                    Cerrar
                </button>
            </div>

            <div class="space-y-5 px-5 py-4">
                <div class="grid gap-4 md:grid-cols-2">
                    <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
                        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Fecha</p>
                        <p class="mt-1 text-sm font-medium text-slate-900">{{ formatDate(previewRow.date) }}</p>
                    </div>

                    <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
                        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Operador</p>
                        <p class="mt-1 text-sm font-medium text-slate-900">{{ previewRow.operator }}</p>
                    </div>
                </div>

                <div class="rounded-lg border border-slate-200">
                    <div class="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900">Puntajes a subir</div>
                    <div class="divide-y divide-slate-200">
                        <div v-for="(score, index) in previewRow.scores" :key="`${previewRow.id}-preview-${index}`" class="flex items-center justify-between px-4 py-3 text-sm">
                            <span class="text-slate-700">{{ operationCards[index]?.label }}</span>
                            <span class="font-semibold text-slate-900">{{ score }}</span>
                        </div>
                    </div>
                </div>

                <div class="grid gap-4 md:grid-cols-2">
                    <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
                        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Validacion</p>
                        <p class="mt-1 min-h-[20px] text-sm text-slate-700">{{ previewRow.validation || 'Sin comentario' }}</p>
                    </div>

                    <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
                        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Que le falta reforzar</p>
                        <p class="mt-1 min-h-[20px] text-sm text-slate-700">{{ previewRow.reinforcement || 'Sin comentario' }}</p>
                    </div>
                </div>
            </div>

            <div class="flex justify-end gap-3 border-t border-slate-200 px-5 py-4">
                <button
                    type="button"
                    class="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    :disabled="previewRow.uploading"
                    @click="closePreview"
                >
                    Cancelar
                </button>

                <button
                    type="button"
                    class="rounded-md border border-primary bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                    :disabled="previewRow.uploading"
                    @click="confirmUpload"
                >
                    <span v-if="previewRow.uploading">Subiendo...</span>
                    <span v-else>Confirmar subida</span>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useAlert } from '~/composables/useAlert';

interface Props {
    templateName: string;
    operationName: string;
}

interface OperationCard {
    id: string;
    label: string;
    priorityLabel: string;
    priorityClass: string;
    description: string;
    cartilla: string;
}

interface EvaluationRow {
    id: string;
    periodLabel: string;
    date: string;
    operator: string;
    scores: Array<number | null>;
    validation: string;
    reinforcement: string;
    uploaded: boolean;
    uploading: boolean;
}

defineProps<Props>();

const { successAlert, errorAlert } = useAlert();
const previewRow = ref<EvaluationRow | null>(null);
const monthsInput = ref('');

const operationCards = reactive<OperationCard[]>([
    {
        id: 'op-1',
        label: 'Operacion 1',
        priorityLabel: 'No Critica',
        priorityClass: 'bg-[#9ed34f]',
        description: 'Orden y limpieza del area (5). Materiales en el proceso.',
        cartilla: 'PG001',
    },
    {
        id: 'op-2',
        label: 'Operacion 2',
        priorityLabel: 'Semi Critica',
        priorityClass: 'bg-[#fff36b]',
        description: 'Embolsado, sellado y peletizado',
        cartilla: 'PG014',
    },
    {
        id: 'op-3',
        label: 'Operacion 3',
        priorityLabel: 'Semi Critica',
        priorityClass: 'bg-[#fff36b]',
        description: 'Identificacion de las partes de la maquina',
        cartilla: 'PG021',
    },
    {
        id: 'op-4',
        label: 'Operacion 4',
        priorityLabel: 'Critica',
        priorityClass: 'bg-[#ff4040] text-white',
        description: 'Arranque y parada de empacadora y control de temperatura',
        cartilla: 'PG032',
    },
    {
        id: 'op-5',
        label: 'Operacion 5',
        priorityLabel: 'Critica',
        priorityClass: 'bg-[#ff4040] text-white',
        description: 'Cambio de rollo',
        cartilla: 'PG041',
    },
    {
        id: 'op-6',
        label: 'Operacion 6',
        priorityLabel: 'Critica',
        priorityClass: 'bg-[#ff4040] text-white',
        description: 'Ingreso de lamina para el proceso',
        cartilla: 'PG056',
    },
    {
        id: 'op-7',
        label: 'Operacion 7',
        priorityLabel: 'Semi Critica',
        priorityClass: 'bg-[#fff36b]',
        description: 'Ajustes Basicos (Regulaciones)',
        cartilla: 'PG071',
    },
]);

const createEvaluationRow = (monthNumber: number): EvaluationRow => {
    const seededRows: Record<number, Partial<EvaluationRow>> = {
        1: {
            date: '2026-05-05',
            operator: 'Carlos Mendoza',
            scores: [3, 2, 1, 1, 1, 1, 1],
        },
        2: {
            date: '2026-06-05',
            operator: 'Rosa Quispe',
            scores: [4, 3, 3, 3, 3, 3, 2],
            uploaded: true,
        },
    };

    const seeded = seededRows[monthNumber];

    return {
        id: `month-${monthNumber}`,
        periodLabel: `Despues de ${monthNumber} ${monthNumber === 1 ? 'mes' : 'meses'} del ingreso:`,
        date: seeded?.date ?? '',
        operator: seeded?.operator ?? '',
        scores: seeded?.scores ?? Array.from({ length: operationCards.length }, () => null),
        validation: '',
        reinforcement: '',
        uploaded: seeded?.uploaded ?? false,
        uploading: false,
    };
};

const evaluationRows = reactive<EvaluationRow[]>([]);

const replaceEvaluationRows = (count: number) => {
    evaluationRows.splice(0, evaluationRows.length, ...Array.from({ length: count }, (_, index) => createEvaluationRow(index + 1)));
};

const generateMonths = async () => {
    const sanitizedCount = Number(monthsInput.value);
    if (!Number.isInteger(sanitizedCount) || sanitizedCount < 1) {
        await errorAlert('Ingresa una cantidad de meses valida mayor o igual a 1.');
        return;
    }

    if (sanitizedCount > 24) {
        await errorAlert('La cantidad maxima permitida es 24 meses.');
        return;
    }

    closePreview();
    replaceEvaluationRows(sanitizedCount);
};

const formatDate = (value: string) => {
    if (!value) return '-';

    const [year, month, day] = value.split('-');
    if (!year || !month || !day) return value;

    return `${day}/${month}/${year}`;
};

const closePreview = () => {
    if (previewRow.value?.uploading) return;
    previewRow.value = null;
};

const uploadRow = async (rowId: string) => {
    const targetRow = evaluationRows.find((row) => row.id === rowId);
    if (!targetRow) return;

    const hasIncompleteScores = targetRow.scores.some((score) => typeof score !== 'number');
    if (hasIncompleteScores) {
        await errorAlert('Completa todos los puntajes de este mes antes de subirlos.');
        return;
    }

    if (!targetRow.date.trim()) {
        await errorAlert('Completa la fecha de este mes antes de subir los puntajes.');
        return;
    }

    if (!targetRow.operator.trim()) {
        await errorAlert('Completa el operador de este mes antes de subir los puntajes.');
        return;
    }

    previewRow.value = targetRow;
};

const confirmUpload = async () => {
    if (!previewRow.value) return;

    previewRow.value.uploading = true;
    await new Promise((resolve) => setTimeout(resolve, 900));
    previewRow.value.uploading = false;
    previewRow.value.uploaded = true;

    const uploadedPeriod = previewRow.value.periodLabel;
    previewRow.value = null;

    await successAlert(`Se simulo la subida de puntajes para "${uploadedPeriod}".`);
};
</script>
