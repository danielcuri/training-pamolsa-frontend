<template>
    <div :class="{ 'dark text-white-dark': store.semidark }">
        <nav
            class="sidebar fixed bottom-0 top-0 z-50 h-full min-h-screen w-[260px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] transition-all duration-300">
            <div class="h-full bg-white dark:bg-[#0e1726]">
                <div class="flex items-center justify-between px-4 py-3">
                    <NuxtLink to="/" class="main-logo flex shrink-0 items-center">
                        <img class="ml-[5px] w-8 flex-none" src="/assets/images/logo.svg" alt="" />
                        <span
                            class="align-middle text-2xl font-semibold ltr:ml-1.5 rtl:mr-1.5 dark:text-white-light lg:inline">VRISTO</span>
                    </NuxtLink>
                    <a href="javascript:;"
                        class="collapse-icon flex h-8 w-8 items-center rounded-full transition duration-300 hover:bg-gray-500/10 hover:text-primary rtl:rotate-180 dark:text-white-light dark:hover:bg-dark-light/10"
                        @click="store.toggleSidebar()">
                        <icon-carets-down class="m-auto rotate-90" />
                    </a>
                </div>
                <client-only>
                    <perfect-scrollbar :options="{
                        swipeEasing: true,
                        wheelPropagation: false,
                    }" class="relative h-[calc(100vh-80px)]">
                        <ul class="relative space-y-0.5 p-4 py-0 font-semibold">
                            <li class="menu nav-item">
                                <button type="button" class="nav-link group w-full"
                                    :class="{ active: activeDropdown === 'dashboard' }"
                                    @click="activeDropdown === 'dashboard' ? (activeDropdown = null) : (activeDropdown = 'dashboard')">
                                    <div class="flex items-center">
                                        <icon-menu-dashboard class="shrink-0 group-hover:!text-primary" />
                                        <span
                                            class="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">
                                            'Dashboard'
                                        </span>
                                    </div>
                                    <div :class="{ '-rotate-90 rtl:rotate-90': activeDropdown !== 'dashboard' }">
                                        <icon-caret-down />
                                    </div>
                                </button>
                                <vue-collapsible :isOpen="activeDropdown === 'dashboard'">
                                    <ul class="sub-menu text-gray-500">
                                        <li>
                                            <NuxtLink to="/" @click="toggleMobileMenu">'Sales'</NuxtLink>
                                        </li>

                                    </ul>
                                </vue-collapsible>
                            </li>

                            <h2
                                class="-mx-4 mb-1 flex items-center bg-white-light/30 px-7 py-3 font-extrabold uppercase dark:bg-dark dark:bg-opacity-[0.08]">
                                <icon-minus class="hidden h-5 w-4 flex-none" />
                                <span>Configuracion</span>
                            </h2>

                            <li class="nav-item">
                                <ul>
                                    <li class="nav-item">
                                        <NuxtLink to="/projects" class="group" @click="toggleMobileMenu">
                                            <div class="flex items-center">
                                                <icon-menu-chat class="shrink-0 group-hover:!text-primary" />

                                                <span
                                                    class="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">Proyectos</span>
                                            </div>
                                        </NuxtLink>
                                    </li>
                                    <li class="nav-item">
                                        <NuxtLink to="/areas" class="group" @click="toggleMobileMenu">
                                            <div class="flex items-center">
                                                <icon-menu-chat class="shrink-0 group-hover:!text-primary" />

                                                <span
                                                    class="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">Areas</span>
                                            </div>
                                        </NuxtLink>
                                    </li>
                                    <li class="nav-item">
                                        <NuxtLink to="/operations" class="group" @click="toggleMobileMenu">
                                            <div class="flex items-center">
                                                <icon-menu-chat class="shrink-0 group-hover:!text-primary" />

                                                <span
                                                    class="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">Operacion</span>
                                            </div>
                                        </NuxtLink>
                                    </li>
                                    <li class="nav-item">
                                        <NuxtLink to="/users" class="group" @click="toggleMobileMenu">
                                            <div class="flex items-center">
                                                <icon-menu-users class="shrink-0 group-hover:!text-primary" />

                                                <span
                                                    class="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">Usuarios</span>
                                            </div>
                                        </NuxtLink>
                                    </li>
                                    <li class="nav-item">
                                        <NuxtLink to="/training-templates" class="group" @click="toggleMobileMenu">
                                            <div class="flex items-center">
                                                <icon-award class="shrink-0 group-hover:!text-primary" />

                                                <span
                                                    class="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">Training Templates</span>
                                            </div>
                                        </NuxtLink>
                                    </li>
                                    <li class="nav-item">
                                        <NuxtLink to="/operational-score-sheet" class="group" @click="toggleMobileMenu">
                                            <div class="flex items-center">
                                                <icon-notes class="shrink-0 group-hover:!text-primary" />

                                                <span
                                                    class="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">Entrenamiento Operativo</span>
                                            </div>
                                        </NuxtLink>
                                    </li>
                                    <li class="nav-item">
                                        <NuxtLink to="/training" class="group" @click="toggleMobileMenu">
                                            <div class="flex items-center">
                                                <icon-award class="shrink-0 group-hover:!text-primary" />

                                                <span
                                                    class="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">Training</span>
                                            </div>
                                        </NuxtLink>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </perfect-scrollbar>
                </client-only>
            </div>
        </nav>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';

import { useAppStore } from '@/stores/index';
import VueCollapsible from 'vue-height-collapsible/vue3';
const store = useAppStore();
const activeDropdown: any = ref('');
const subActive: any = ref('');

onMounted(() => {
    setTimeout(() => {
        const selector = document.querySelector('.sidebar ul a[href="' + window.location.pathname + '"]');

        if (selector) {
            selector.classList.add('active');
            const ul: any = selector.closest('ul.sub-menu');
            if (ul) {
                let ele: any = ul.closest('li.menu').querySelectorAll('.nav-link') || [];

                if (ele.length) {
                    ele = ele[0];
                    setTimeout(() => {
                        ele.click();
                    });
                }
            }
        }
    });
});

const toggleMobileMenu = () => {
    if (window.innerWidth < 1024) {
        store.toggleSidebar();
    }
};
</script>
