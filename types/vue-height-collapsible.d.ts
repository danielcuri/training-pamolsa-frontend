// types/vue-height-collapsible.d.ts
declare module 'vue-height-collapsible/vue3' {
    import { DefineComponent } from 'vue';

    const VueCollapsible: DefineComponent<{
        isOpen?: boolean;
        duration?: number;
        easing?: string;
        tag?: string;
    }>;

    export default VueCollapsible;
}
