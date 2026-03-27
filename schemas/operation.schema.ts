// schemas/operation.schema.ts
import { z } from 'zod';

export enum OperationPriority {
    CRITICAL = 'CRITICAL',
    SEMI_CRITICAL = 'SEMI_CRITICAL',
    NON_CRITICAL = 'NON_CRITICAL',
}

export const operationSchema = z.object({
    name: z
        .string()
        .min(1, 'El nombre es obligatorio')
        .min(3, 'El nombre debe tener al menos 3 caracteres')
        .max(100, 'El nombre no puede superar 100 caracteres'),

    description: z.string().max(500, 'La descripción no puede superar 500 caracteres').optional(),

    priority: z.nativeEnum(OperationPriority, {
        errorMap: () => ({ message: 'La prioridad debe ser CRITICAL, SEMI_CRITICAL o NON_CRITICAL' }),
    }),

    weightPercent: z
        .number()
        .min(0, 'El peso no puede ser negativo')
        .max(100, 'El peso no puede superar 100')
        .optional()
        .or(
            z
                .string()
                .transform((val) => (val === '' ? undefined : Number(val)))
                .optional(),
        ),

    status: z
        .enum(['ACTIVE', 'INACTIVE'], {
            errorMap: () => ({ message: 'El status debe ser ACTIVE o INACTIVE' }),
        })
        .optional(),

    areaId: z.string().uuid('El área seleccionada no es válida').min(1, 'Debes seleccionar un área'),
});

export type OperationFormValues = z.infer<typeof operationSchema>;
