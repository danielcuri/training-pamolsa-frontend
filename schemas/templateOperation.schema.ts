import { z } from 'zod';
import { OperationPriority } from '~/types/operation';

export const templateOperationSchema = z.object({
    name: z
        .string()
        .min(1, 'El nombre es obligatorio')
        .min(3, 'El nombre debe tener al menos 3 caracteres')
        .max(100, 'El nombre no puede superar 100 caracteres'),

    description: z.string().max(500, 'La descripcion no puede superar 500 caracteres').optional(),

    priority: z.nativeEnum(OperationPriority, {
        errorMap: () => ({ message: 'La prioridad debe ser CRITICAL, SEMI_CRITICAL o NON_CRITICAL' }),
    }),

    weightPercent: z.coerce.number().min(0, 'El peso no puede ser negativo').max(100, 'El peso no puede superar 100'),

    order: z.coerce.number().int('El orden debe ser un numero entero').min(0, 'El orden no puede ser negativo'),

    areaOperationId: z.string().uuid('La operacion seleccionada no es valida').min(1, 'Debes seleccionar una operacion'),
});

export type TemplateOperationFormValues = z.infer<typeof templateOperationSchema>;
