export default defineNuxtRouteMiddleware((to) => {
    const authStore = useAuthStore();

    if (!authStore.isAuthenticated) {
        return navigateTo('/auth');
    }

    const allowedRoles = to.meta.roles as string[] | undefined;
    if (!allowedRoles?.length) return;

    if (!allowedRoles.includes(authStore.role)) {
        return navigateTo('/error/error403');
    }
});
