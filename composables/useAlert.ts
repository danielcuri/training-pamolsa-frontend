import Swal from 'sweetalert2';

export const useAlert = () => {
    const successAlert = async (message: string) => {
        await Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: message,
            confirmButtonText: 'Aceptar',
            timerProgressBar: true,
        });
    };

    const errorAlert = async (message: string) => {
        await Swal.fire({
            icon: 'error',
            title: 'Error',
            text: message,
            confirmButtonText: 'Entendido',
        });
    };

    const confirmAlert = async (message: string = '¿Estás seguro de continuar?') => {
        const result = await Swal.fire({
            icon: 'warning',
            title: '¿Estás seguro?',
            text: message,
            showCancelButton: true,
            confirmButtonText: 'Sí, continuar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#d33',
        });

        return result.isConfirmed;
    };

    return {
        successAlert,
        errorAlert,
        confirmAlert,
    };
};
