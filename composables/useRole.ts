export const useRole = () => {
    const authStore = useAuthStore();

    const role = computed(() => authStore.role);
    const isAdmin = computed(() => authStore.role === 'ADMIN');
    const isSupervisor = computed(() => authStore.role === 'SUPERVISOR');
    const isSuperAdmin = computed(() => authStore.role === 'SUPERADMIN');

    const isAnyRole = (roles: string[]) => roles.includes(authStore.role);

    return { role, isAdmin, isSupervisor, isSuperAdmin, isAnyRole };
};
