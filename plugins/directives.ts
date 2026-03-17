export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.directive('role', {
        mounted(el, binding) {
            const authStore = useAuthStore();
            const allowed = Array.isArray(binding.value) ? binding.value : [binding.value];

            if (!allowed.includes(authStore.role)) {
                el.remove();
            }
        },
    });
});
