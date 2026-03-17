// middleware/role.ts
export default defineNuxtRouteMiddleware((to) => {
    if (import.meta.server) return;

    const authStore = useAuthStore();

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

    const allowedRoles = to.meta.roles as string[] | undefined;
    if (!allowedRoles?.length) return;

    if (!allowedRoles.includes(authStore.role)) {
        return navigateTo('/error/error403');
    }
});
