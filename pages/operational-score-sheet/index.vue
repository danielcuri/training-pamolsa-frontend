<template>
    <div class="space-y-5">
        <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
                <h1 class="text-2xl font-extrabold uppercase text-primary">
                    Entrenamiento Operativo
                </h1>
                <p class="text-sm text-gray-500">
                    Mantenedor independiente con datos ficticios para simulacion de carga de puntajes
                </p>
            </div>
        </div>

        <TemplateOperationScoreSheet template-name="Template Demo Operativo" operation-name="Orden y limpieza del area" />
    </div>
</template>

<script setup lang="ts">
import TemplateOperationScoreSheet from '~/components/templateOperations/TemplateOperationScoreSheet.vue';

definePageMeta({
    middleware: ['auth', 'role'],
    roles: ['ADMIN', 'SUPERVISOR', 'SUPERADMIN'],
});
</script>
