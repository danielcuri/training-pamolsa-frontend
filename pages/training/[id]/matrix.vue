<template>
    <div class="space-y-5">
        <NuxtLink to="/training" class="inline-flex items-center text-sm font-medium text-primary hover:underline">
            Volver a training
        </NuxtLink>

        <div v-if="loading" class="panel text-sm text-gray-500">
            Cargando matriz...
        </div>

        <div v-else-if="error" class="panel text-sm text-red-600">
            {{ error }}
        </div>

        <TrainingMatrixView v-else-if="matrix" :matrix="matrix" @refresh="loadMatrix" />
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import TrainingMatrixView from '~/components/trainings/TrainingMatrixView.vue';
import { trainingService } from '~/services/trainingService';
import type { TrainingMatrixData } from '~/types/training';

definePageMeta({
    middleware: ['auth', 'role'],
    roles: ['ADMIN', 'SUPERVISOR', 'SUPERADMIN'],
});

const route = useRoute();
const { apiFetch } = useApiFetch();
const svc = trainingService(apiFetch);

const matrix = ref<TrainingMatrixData | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

const loadMatrix = async () => {
    loading.value = true;
    error.value = null;

    try {
        const trainingId = String(route.params.id ?? '');
        const res = await svc.matrix(trainingId);
        if (res.status && res.data) {
            matrix.value = res.data;
        } else {
            matrix.value = null;
            error.value = 'No se pudo cargar la matriz.';
        }
    } catch (e: any) {
        matrix.value = null;
        error.value = e?.data?.message ?? 'Error al cargar la matriz de training.';
    } finally {
        loading.value = false;
    }
};

await loadMatrix();
</script>
