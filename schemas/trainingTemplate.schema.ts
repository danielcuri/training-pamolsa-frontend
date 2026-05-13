import { z } from 'zod';

const requiredUuid = (requiredMessage: string, invalidMessage: string) =>
    z
        .string()
        .min(1, requiredMessage)
        .uuid(invalidMessage);

const normalizeNumericInput = (value: unknown) => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
        const trimmedValue = value.trim();
        if (!trimmedValue) return Number.NaN;
        return Number(trimmedValue);
    }

    return Number.NaN;
};

const requiredPositiveInteger = (label: string) =>
    z
        .union([z.string(), z.number()])
        .transform((value) => normalizeNumericInput(value))
        .refine((value) => Number.isInteger(value) && value > 0, `${label} debe ser un entero mayor a 0`);

const requiredNonNegativeNumber = (label: string) =>
    z
        .union([z.string(), z.number()])
        .transform((value) => normalizeNumericInput(value))
        .refine((value) => Number.isFinite(value) && value >= 0, `${label} debe ser un número mayor o igual a 0`);

export const trainingTemplateSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, 'El nombre es obligatorio')
        .min(3, 'El nombre debe tener al menos 3 caracteres')
        .max(150, 'El nombre no puede superar 150 caracteres'),
    version: requiredPositiveInteger('La versión'),
    periodDurationDays: requiredPositiveInteger('La duración del período'),
    totalPeriods: requiredPositiveInteger('El total de períodos'),
    minimumPassingScore: requiredNonNegativeNumber('La nota mínima'),
    certificateTemplatePdf: z.string().trim().max(500, 'El campo PDF no puede superar 500 caracteres').optional(),
    status: z.enum(['ACTIVE', 'INACTIVE'], {
        errorMap: () => ({ message: 'Debes seleccionar un estado válido' }),
    }),
    projectId: requiredUuid('Debes seleccionar un proyecto', 'El proyecto seleccionado no es válido'),
    areaId: requiredUuid('Debes seleccionar un área', 'El área seleccionada no es válida'),
});

export type TrainingTemplateFormValues = z.infer<typeof trainingTemplateSchema>;
