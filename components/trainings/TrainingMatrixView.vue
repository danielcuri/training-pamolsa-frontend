<template>
    <div v-if="matrix" class="space-y-5">
        <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
                <h1 class="text-2xl font-extrabold uppercase text-primary">
                    Matriz de Training
                </h1>
                <p class="text-sm text-gray-500">
                    {{ matrix.collaborator.name }} · {{ matrix.template.name }} · {{ matrix.project.name }} / {{ matrix.area.name }}
                </p>
            </div>
        </div>

        <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div class="panel !mb-0">
                <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Colaborador</p>
                <p class="mt-1 text-sm font-semibold text-slate-900">{{ matrix.collaborator.name }}</p>
                <p class="mt-1 text-sm text-slate-600">{{ matrix.collaborator.email || '-' }}</p>
            </div>
            <div class="panel !mb-0">
                <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Template</p>
                <p class="mt-1 text-sm font-semibold text-slate-900">{{ matrix.template.name }}</p>
                <p class="mt-1 text-sm text-slate-600">Version {{ matrix.template.version }}</p>
            </div>
            <div class="panel !mb-0">
                <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Training</p>
                <p class="mt-1 text-sm font-semibold text-slate-900">{{ matrix.training.status }}</p>
                <p class="mt-1 text-sm text-slate-600">Inicio: {{ formatDate(matrix.training.startDate) }}</p>
            </div>
            <div class="panel !mb-0">
                <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Resumen</p>
                <p class="mt-1 text-sm font-semibold text-slate-900">{{ matrix.summary.totalOperations }} operaciones</p>
                <p class="mt-1 text-sm text-slate-600">{{ matrix.summary.totalPeriods }} periodos · Puntaje minimo {{ matrix.summary.minimumPassingScore }}</p>
            </div>
        </div>

        <div class="overflow-x-auto rounded-xl border border-slate-200 bg-[#fcfcfd] p-4 text-black shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
            <div class="min-w-[1120px] text-[12px]">
                <div class="rounded-t-lg bg-primary py-1 text-center text-sm font-bold tracking-wide text-white shadow-sm">
                    MATRIZ DE ENTRENAMIENTO
                </div>

                <div class="rounded-b-lg border border-t-0 border-slate-200 bg-white px-4 py-4">
                    <p class="mb-4 text-[12px] font-semibold text-slate-700">
                        El colaborador debera obtener una calificacion minima de {{ matrix.summary.minimumPassingScore }} en las
                        {{ matrix.summary.totalOperations }} operaciones para completar su entrenamiento.
                    </p>

                    <div class="items-start gap-x-8 gap-y-2" :style="headerGridStyle">
                        <div class="pr-3 pt-1 text-right text-slate-700">Numero de la operacion</div>
                        <template v-for="operation in orderedOperations" :key="`${operation.id}-header`">
                            <div class="text-center font-bold text-slate-900">{{ operation.title }}</div>
                        </template>

                        <div class="pr-3 pt-2 text-right text-slate-700">Prioridad de la operacion:</div>
                        <template v-for="operation in orderedOperations" :key="`${operation.id}-priority`">
                            <div
                                class="rounded-t-md border border-slate-300 py-1 text-center font-bold shadow-[0_4px_12px_rgba(15,23,42,0.06)]"
                                :class="priorityClass(operation.priority)"
                            >
                                {{ priorityLabel(operation.priority) }}
                            </div>
                        </template>

                        <div class="pr-3 pt-2 text-right text-slate-700">Descripcion de la operacion:</div>
                        <template v-for="operation in orderedOperations" :key="`${operation.id}-description`">
                            <div class="-mt-px min-h-[96px] border border-slate-300 bg-slate-50 px-2 py-2 text-center text-[11px] leading-5 text-slate-800">
                                {{ operation.description || operation.name }}
                            </div>
                        </template>

                        <div class="pr-3 pt-2 text-right text-slate-700">Cartilla asociada:</div>
                        <template v-for="operation in orderedOperations" :key="`${operation.id}-cartilla`">
                            <div class="rounded-b-md border border-slate-300 bg-white py-2 text-center font-semibold text-slate-700 shadow-[0_4px_12px_rgba(15,23,42,0.06)]">
                                {{ operation.code || operation.cartilla || '-' }}
                            </div>
                        </template>
                    </div>

                    <div class="mt-4 space-y-4">
                        <div v-for="period in periodForms" :key="period.id">
                            <div class="items-center gap-x-8" :style="periodGridStyle">
                                <div class="rounded-md border border-slate-200 bg-[#e8eef7] px-3 py-2 text-center font-medium text-slate-700 shadow-[0_2px_6px_rgba(15,23,42,0.04)]">
                                    {{ period.title }}
                                </div>

                                <template v-for="score in period.scores" :key="`${period.id}-${score.templateOperationId}`">
                                    <input
                                        v-model.number="score.score"
                                        type="number"
                                        min="0"
                                        max="5"
                                        class="h-9 w-full rounded-sm border border-slate-300 bg-white px-2 text-center font-medium text-slate-800 shadow-[inset_0_1px_2px_rgba(15,23,42,0.05)] outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/20"
                                    />
                                </template>
                            </div>

                            <div class="mt-3 grid grid-cols-[190px_1fr_1fr] items-stretch gap-x-8">
                                <div class="space-y-3">
                                    <div class="flex items-center gap-2">
                                        <span class="min-w-[58px] font-semibold text-slate-700">Fecha:</span>
                                        <input
                                            v-model="period.evaluationDate"
                                            type="date"
                                            class="w-full border-0 border-b border-slate-400 bg-transparent px-1 py-1 text-slate-800 outline-none transition focus:border-primary"
                                        />
                                    </div>

                                    <div class="flex items-center gap-2">
                                        <span class="min-w-[58px] font-semibold text-slate-700">Operador:</span>
                                        <select
                                            v-model="period.evaluatorId"
                                            class="w-full border-0 border-b border-slate-400 bg-transparent px-1 py-1 text-slate-800 outline-none transition focus:border-primary"
                                        >
                                            <option value="">Selecciona un operador</option>
                                            <option v-for="user in activeUsers" :key="user.id" :value="user.id">
                                                {{ user.name }}
                                            </option>
                                        </select>
                                    </div>
                                </div>

                                <div class="rounded-sm border border-slate-300 bg-slate-50 p-2 shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
                                    <span class="font-semibold text-slate-700">Validacion:</span>
                                    <textarea
                                        v-model="period.validationNotes"
                                        rows="2"
                                        class="mt-1 w-full resize-none border-0 bg-transparent p-0 text-[11px] text-slate-800 outline-none"
                                    ></textarea>
                                </div>

                                <div class="rounded-sm border border-slate-300 bg-slate-50 p-2 shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
                                    <span class="font-semibold text-slate-700">Que le falta reforzar?</span>
                                    <textarea
                                        v-model="period.reinforcementNotes"
                                        rows="2"
                                        class="mt-1 w-full resize-none border-0 bg-transparent p-0 text-[11px] text-slate-800 outline-none"
                                    ></textarea>
                                </div>
                            </div>

                            <div class="mt-3 flex justify-end">
                                <button
                                    type="button"
                                    class="h-9 rounded-sm border border-primary bg-primary px-4 text-[11px] font-semibold text-white shadow-[0_6px_14px_rgba(67,97,238,0.22)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                                    :disabled="period.uploading"
                                    @click="openPreview(period.id)"
                                >
                                    <span v-if="period.uploading">Subiendo...</span>
                                    <span v-else>Subir puntaje</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="previewPeriod" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
            <div class="w-full max-w-3xl rounded-xl bg-white shadow-[0_20px_60px_rgba(15,23,42,0.25)]">
                <div class="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                    <div>
                        <h3 class="text-lg font-semibold text-slate-900">Confirmar subida de puntaje</h3>
                        <p class="text-sm text-slate-500">{{ previewPeriod.title }}</p>
                    </div>

                    <button type="button" class="text-sm font-medium text-slate-500 transition hover:text-slate-700" :disabled="previewPeriod.uploading" @click="closePreview">
                        Cerrar
                    </button>
                </div>

                <div class="space-y-5 px-5 py-4">
                    <div class="grid gap-4 md:grid-cols-2">
                        <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
                            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Fecha</p>
                            <p class="mt-1 text-sm font-medium text-slate-900">{{ formatDate(previewPeriod.evaluationDate) }}</p>
                        </div>

                        <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
                            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Operador</p>
                            <p class="mt-1 text-sm font-medium text-slate-900">{{ resolveEvaluatorLabel(previewPeriod.evaluatorId) }}</p>
                        </div>
                    </div>

                    <div class="rounded-lg border border-slate-200">
                        <div class="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900">Puntajes a subir</div>
                        <div class="divide-y divide-slate-200">
                            <div v-for="score in previewPeriod.scores" :key="`${previewPeriod.id}-${score.templateOperationId}`" class="flex items-center justify-between px-4 py-3 text-sm">
                                <span class="text-slate-700">{{ resolveOperationLabel(score.templateOperationId) }}</span>
                                <span class="font-semibold text-slate-900">{{ score.score }}</span>
                            </div>
                        </div>
                    </div>

                    <div class="grid gap-4 md:grid-cols-2">
                        <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
                            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Validacion</p>
                            <p class="mt-1 min-h-[20px] text-sm text-slate-700">{{ previewPeriod.validationNotes || 'Sin comentario' }}</p>
                        </div>

                        <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
                            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Que le falta reforzar</p>
                            <p class="mt-1 min-h-[20px] text-sm text-slate-700">{{ previewPeriod.reinforcementNotes || 'Sin comentario' }}</p>
                        </div>
                    </div>
                </div>

                <div class="flex justify-end gap-3 border-t border-slate-200 px-5 py-4">
                    <button
                        type="button"
                        class="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                        :disabled="previewPeriod.uploading"
                        @click="closePreview"
                    >
                        Cancelar
                    </button>

                    <button
                        type="button"
                        class="rounded-md border border-primary bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                        :disabled="previewPeriod.uploading"
                        @click="submitPreview"
                    >
                        <span v-if="previewPeriod.uploading">Subiendo...</span>
                        <span v-else>Confirmar subida</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { trainingService } from '~/services/trainingService';
import { userService } from '~/services/userService';
import type { TrainingMatrixData, TrainingPeriodProgressPayload, TrainingUserOption } from '~/types/training';

interface EditableScore {
    templateOperationId: string;
    score: number | null;
    notes: string;
    checklist: string;
}

interface EditablePeriod {
    id: string;
    title: string;
    evaluationDate: string;
    evaluatorId: string;
    validationNotes: string;
    reinforcementNotes: string;
    scores: EditableScore[];
    uploading: boolean;
}

const props = defineProps<{
    matrix: TrainingMatrixData;
}>();

const emit = defineEmits<{
    refresh: [];
}>();

const { apiFetch } = useApiFetch();
const svc = trainingService(apiFetch);
const userSvc = userService(apiFetch);
const { successAlert, errorAlert } = useAlert();

const previewPeriod = ref<EditablePeriod | null>(null);
const orderedOperations = computed(() => [...props.matrix.operations].sort((a, b) => a.order - b.order));
const periodForms = ref<EditablePeriod[]>([]);
const activeUsers = ref<TrainingUserOption[]>([]);
const toDateInput = (value?: string | null) => (value ? value.slice(0, 10) : '');
const toIsoDateTime = (value: string) => new Date(`${value}T00:00:00`).toISOString();
const resolveEvaluatorId = (evaluator: TrainingMatrixData['periods'][number]['evaluator']) => {
    if (!evaluator) return '';
    if (typeof evaluator === 'string') return evaluator;
    return evaluator.id ? String(evaluator.id) : '';
};

const loadActiveUsers = async () => {
    try {
        const res = await userSvc.list({
            page: 1,
            limit: 100,
            sortBy: 'createdAt',
            order: 'desc',
            status: 'ACTIVE',
        });
        const apiData: any = res?.data;
        const itemsRaw = Array.isArray(apiData) ? apiData : (apiData?.items ?? apiData?.list ?? apiData?.data ?? []);

        activeUsers.value = Array.isArray(itemsRaw)
            ? itemsRaw
                  .filter((raw: any) => raw?.id && raw?.name)
                  .map((raw: any) => ({
                      id: String(raw.id),
                      name: String(raw.name),
                      email: raw?.email ? String(raw.email) : null,
                  }))
            : [];
    } catch (e: any) {
        activeUsers.value = [];
        await errorAlert(e?.data?.message ?? 'Error al cargar usuarios activos.');
    }
};

onMounted(() => {
    loadActiveUsers();
});

watch(
    () => props.matrix,
    (value) => {
        periodForms.value = value.periods.map((period) => ({
            id: period.id,
            title: period.title,
            evaluationDate: toDateInput(period.evaluationDate || period.startDate),
            evaluatorId: resolveEvaluatorId(period.evaluator),
            validationNotes: period.validationNotes || '',
            reinforcementNotes: period.reinforcementNotes || '',
            scores: orderedOperations.value.map((operation) => {
                const existingScore = period.scores.find((item) => item.operationId === operation.id);
                return {
                    templateOperationId: operation.id,
                    score: existingScore?.score ?? null,
                    notes: existingScore?.notes || '',
                    checklist: existingScore?.checklist || '',
                };
            }),
            uploading: false,
        }));
    },
    { immediate: true, deep: true },
);

const headerGridStyle = computed(() => ({
    display: 'grid',
    gridTemplateColumns: `190px repeat(${orderedOperations.value.length}, minmax(0, 1fr))`,
}));

const periodGridStyle = computed(() => ({
    display: 'grid',
    gridTemplateColumns: `190px repeat(${orderedOperations.value.length}, minmax(0, 1fr))`,
}));

const priorityLabel = (value: string) => {
    if (value === 'CRITICAL') return 'Critica';
    if (value === 'SEMI_CRITICAL') return 'Semi Critica';
    if (value === 'NON_CRITICAL') return 'No Critica';
    return value;
};

const priorityClass = (value: string) => {
    if (value === 'CRITICAL') return 'bg-[#ff4040] text-white';
    if (value === 'SEMI_CRITICAL') return 'bg-[#fff36b]';
    if (value === 'NON_CRITICAL') return 'bg-[#9ed34f]';
    return 'bg-slate-200';
};

const resolveOperationLabel = (operationId: string) => {
    return orderedOperations.value.find((operation) => operation.id === operationId)?.title ?? operationId;
};

const resolveEvaluatorLabel = (evaluatorId: string) => {
    return activeUsers.value.find((user) => user.id === evaluatorId)?.name ?? evaluatorId;
};

const formatDate = (value?: string | null) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('es-PE');
};

const openPreview = async (periodId: string) => {
    const target = periodForms.value.find((period) => period.id === periodId);
    if (!target) return;

    const hasIncompleteScores = target.scores.some((score) => typeof score.score !== 'number');
    if (hasIncompleteScores) {
        await errorAlert('Completa todos los puntajes de este periodo antes de subirlos.');
        return;
    }

    if (!target.evaluationDate.trim()) {
        await errorAlert('Completa la fecha de evaluacion antes de subir los puntajes.');
        return;
    }

    if (!target.evaluatorId.trim()) {
        await errorAlert('Completa el operador de este periodo antes de subir los puntajes.');
        return;
    }

    previewPeriod.value = target;
};

const closePreview = () => {
    if (previewPeriod.value?.uploading) return;
    previewPeriod.value = null;
};

const submitPreview = async () => {
    if (!previewPeriod.value) return;

    const currentPeriod = previewPeriod.value;

    const payload: TrainingPeriodProgressPayload = {
        evaluationDate: toIsoDateTime(currentPeriod.evaluationDate),
        evaluatorId: currentPeriod.evaluatorId.trim(),
        validationNotes: currentPeriod.validationNotes.trim(),
        reinforcementNotes: currentPeriod.reinforcementNotes.trim(),
        scores: currentPeriod.scores.map((score) => ({
            templateOperationId: score.templateOperationId,
            score: Number(score.score),
            notes: score.notes.trim(),
            checklist: score.checklist.trim(),
        })),
    };

    currentPeriod.uploading = true;

    try {
        await svc.progress(currentPeriod.id, payload);
        await successAlert(`Puntajes registrados correctamente para "${currentPeriod.title}".`);
        previewPeriod.value = null;
        emit('refresh');
    } catch (e: any) {
        await errorAlert(e?.data?.message ?? 'Error al registrar el progreso del periodo.');
    } finally {
        currentPeriod.uploading = false;
    }
};
</script>
