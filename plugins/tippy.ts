export default defineNuxtPlugin(async (nuxtApp) => {
    if (import.meta.client) {
        const { TippyPlugin } = await import('tippy.vue');
        nuxtApp.vueApp.use(TippyPlugin);
        return;
    }

    nuxtApp.vueApp.directive('tippy', {
        getSSRProps() {
            return {};
        },
    });

    nuxtApp.vueApp.component('tippy', {
        name: 'TippyStub',
        render() {
            return null;
        },
    });

    nuxtApp.vueApp.component('tippy-singleton', {
        name: 'TippySingletonStub',
        render() {
            return null;
        },
    });
});
