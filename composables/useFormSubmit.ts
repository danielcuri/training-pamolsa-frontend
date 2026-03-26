import { useAlert } from '~/composables/useAlert';

interface FormSubmitOptions<T> {
    payload: () => T; // construye el payload
    onCreate: (payload: T) => Promise<any>; // llama al create del service
    onUpdate: (id: string, payload: T) => Promise<any>; // llama al update
    editingId: Ref<string | null>;
    modalMode: Ref<'create' | 'edit'>;
    saving: Ref<boolean>;
    formError: Ref<string | null>;
    successMessage?: {
        create?: string;
        update?: string;
    };
    onSuccess: () => Promise<void>; // closeModal + loadData
}

export const useFormSubmit = () => {
    const { successAlert, errorAlert } = useAlert();

    const submit = async <T>(options: FormSubmitOptions<T>) => {
        const { payload, onCreate, onUpdate, editingId, modalMode, saving, formError, successMessage, onSuccess } = options;

        formError.value = null;
        saving.value = true;

        try {
            const data = payload();

            if (modalMode.value === 'create') {
                await onCreate(data);
            } else {
                if (!editingId.value) throw new Error('ID requerido para editar');
                await onUpdate(editingId.value, data);
            }

            await onSuccess();

            const message =
                modalMode.value === 'create'
                    ? (successMessage?.create ?? 'Registro creado correctamente.')
                    : (successMessage?.update ?? 'Registro actualizado correctamente.');

            await successAlert(message);
        } catch (e: any) {
            const message = e?.data?.message ?? 'Error al guardar el registro.';
            formError.value = message;
            await errorAlert(message);
        } finally {
            saving.value = false;
        }
    };

    return { submit };
};
