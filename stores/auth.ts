// stores/auth.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User } from '~/types/api';

export const useAuthStore = defineStore('auth', () => {
    // Inicializa leyendo localStorage si ya existe sesión previa
    const token = ref<string | null>(import.meta.client ? localStorage.getItem('auth_token') : null);
    const user = ref<User | null>(import.meta.client ? JSON.parse(localStorage.getItem('auth_user') ?? 'null') : null);
    const role = ref<string>(import.meta.client ? (localStorage.getItem('auth_role') ?? '') : '');

    const isAuthenticated = computed(() => !!token.value);
    const isRole = (r: string) => role.value === r;
    const isAnyRole = (roles: string[]) => roles.includes(role.value);

    const setSession = (newToken: string, newUser: User) => {
        token.value = newToken;
        user.value = newUser;
        role.value = newUser.role ?? '';

        if (import.meta.client) {
            localStorage.setItem('auth_token', newToken);
            localStorage.setItem('auth_user', JSON.stringify(newUser));
            localStorage.setItem('auth_role', newUser.role ?? '');
        }
    };

    const logout = () => {
        token.value = null;
        user.value = null;
        role.value = '';

        if (import.meta.client) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            localStorage.removeItem('auth_role');
        }
    };

    return { token, user, role, isAuthenticated, isRole, isAnyRole, setSession, logout };
});
