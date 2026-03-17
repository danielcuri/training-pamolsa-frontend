import { authService } from '~/services/authService';

export const useAuth = () => {
    const { apiFetch } = useApiFetch();
    const authStore = useAuthStore();
    const router = useRouter();
    const svc = authService(apiFetch);

    const loading = ref(false);
    const error = ref<string | null>(null);

    const login = async (email: string, password: string) => {
        loading.value = true;
        error.value = null;
        try {
            const res = await svc.login(email, password);
            if (res.status && res.data) {
                authStore.setSession(res.data.token, res.data.user);
                await router.push('/dashboard');
            }
        } catch (e: any) {
            error.value = e.data?.message ?? 'Error al iniciar sesión';
        } finally {
            loading.value = false;
        }
    };

    const logout = async () => {
        try {
            await svc.logout();
        } catch {}
        authStore.logout();
        await router.push('/auth');
    };

    return { login, logout, loading, error };
};
