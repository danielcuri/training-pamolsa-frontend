// middleware/auth.ts
export default defineNuxtRouteMiddleware(() => {
    // En SSR dejamos pasar, la validación real ocurre en el cliente
    if (import.meta.server) return;

    const authStore = useAuthStore();

    // En cliente rehidratamos si el store está vacío
    if (!authStore.token) {
        const token = localStorage.getItem('auth_token');
        const user = localStorage.getItem('auth_user');

        if (token && user) {
            authStore.setSession(token, JSON.parse(user));
        }
    }

    if (!authStore.isAuthenticated) {
        return navigateTo('/auth');
    }
});
