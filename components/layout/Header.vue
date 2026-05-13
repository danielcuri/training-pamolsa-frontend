<template>
    <header class="z-40" :class="{ dark: store.semidark && store.menu === 'horizontal' }">
        <div class="shadow-sm">
            <div class="relative flex w-full items-center bg-white px-5 py-2.5 dark:bg-[#0e1726]">
                <div class="horizontal-logo flex items-center justify-between ltr:mr-2 rtl:ml-2 lg:hidden">
                    <NuxtLink to="/" class="main-logo flex shrink-0 items-center">
                        <img class="inline w-8 ltr:-ml-1 rtl:-mr-1" src="/assets/images/logo.svg" alt="" />
                        <span
                            class="hidden align-middle text-2xl font-semibold transition-all duration-300 ltr:ml-1.5 rtl:mr-1.5 dark:text-white-light md:inline">VRISTO</span>
                    </NuxtLink>

                    <a href="javascript:;"
                        class="collapse-icon flex flex-none rounded-full bg-white-light/40 p-2 hover:bg-white-light/90 hover:text-primary ltr:ml-2 rtl:mr-2 dark:bg-dark/40 dark:text-[#d0d2d6] dark:hover:bg-dark/60 dark:hover:text-primary lg:hidden"
                        @click="store.toggleSidebar()">
                        <icon-menu class="h-5 w-5" />
                    </a>
                </div>
                <div class="hidden ltr:mr-2 rtl:ml-2 sm:block">
                    <ul class="flex items-center space-x-2 rtl:space-x-reverse dark:text-[#d0d2d6]">
                        <li>
                            <button type="button"
                                class="block rounded-full bg-white-light/40 p-2 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60">
                                <icon-calendar />
                            </button>
                        </li>
                        <li>
                            <button type="button"
                                class="block rounded-full bg-white-light/40 p-2 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60">
                                <icon-edit />
                            </button>
                        </li>
                        <li>
                            <button type="button"
                                class="block rounded-full bg-white-light/40 p-2 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60">
                                <icon-chat-notification />
                            </button>
                        </li>
                    </ul>
                </div>
                <div
                    class="flex items-center space-x-1.5 ltr:ml-auto rtl:mr-auto rtl:space-x-reverse dark:text-[#d0d2d6] sm:flex-1 ltr:sm:ml-0 sm:rtl:mr-0 lg:space-x-2">
                    <div class="sm:ltr:mr-auto sm:rtl:ml-auto">
                        <form
                            class="absolute inset-x-0 top-1/2 z-10 mx-4 hidden -translate-y-1/2 sm:relative sm:top-0 sm:mx-0 sm:block sm:translate-y-0"
                            :class="{ '!block': search }" @submit.prevent="search = false">
                            <div class="relative">
                                <input type="text"
                                    class="peer form-input bg-gray-100 placeholder:tracking-widest ltr:pl-9 ltr:pr-9 rtl:pl-9 rtl:pr-9 sm:bg-transparent ltr:sm:pr-4 rtl:sm:pl-4"
                                    placeholder="Search..." />
                                <button type="button"
                                    class="absolute inset-0 h-9 w-9 appearance-none peer-focus:text-primary ltr:right-auto rtl:left-auto">
                                    <icon-search class="mx-auto" />
                                </button>
                                <button type="button"
                                    class="absolute top-1/2 block -translate-y-1/2 hover:opacity-80 ltr:right-2 rtl:left-2 sm:hidden"
                                    @click="search = false">
                                    <icon-x-circle />
                                </button>
                            </div>
                        </form>

                        <button type="button"
                            class="search_btn rounded-full bg-white-light/40 p-2 hover:bg-white-light/90 dark:bg-dark/40 dark:hover:bg-dark/60 sm:hidden"
                            @click="search = !search">
                            <icon-search class="mx-auto h-4.5 w-4.5 dark:text-[#d0d2d6]" />
                        </button>
                    </div>
                    <div>
                        <a href="javascript:;" v-show="store.theme === 'light'"
                            class="flex items-center rounded-full bg-white-light/40 p-2 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"
                            @click="store.toggleTheme('dark')">
                            <icon-sun />
                        </a>
                        <a href="javascript:;" v-show="store.theme === 'dark'"
                            class="flex items-center rounded-full bg-white-light/40 p-2 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"
                            @click="store.toggleTheme('system')">
                            <icon-moon />
                        </a>
                        <a href="javascript:;" v-show="store.theme === 'system'"
                            class="flex items-center rounded-full bg-white-light/40 p-2 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"
                            @click="store.toggleTheme('light')">
                            <icon-laptop />
                        </a>
                    </div>

                    <div class="dropdown shrink-0">
                        <client-only>
                            <Popper :placement="store.rtlClass === 'rtl' ? 'bottom-end' : 'bottom-start'"
                                offsetDistance="8">
                                <button type="button"
                                    class="block rounded-full bg-white-light/40 p-2 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60">
                                    <img :src="currentFlag" alt="flag" class="h-5 w-5 rounded-full object-cover" />
                                </button>
                                <template #content="{ close }">
                                    <ul class="grid w-[280px] grid-cols-2 gap-2 !px-2 font-semibold text-dark dark:text-white-dark dark:text-white-light/90"
                                        @click="close()">
                                        <template v-for="item in store.languageList" :key="item.code">
                                            <li>
                                                <button type="button" class="w-full hover:text-primary"
                                                    :class="{ 'bg-primary/10 text-primary': store.locale === item?.code }"
                                                    @click="changeLanguage(item)">
                                                    <img class="h-5 w-5 rounded-full object-cover"
                                                        :src="`/assets/images/flags/${item.code.toUpperCase()}.svg`"
                                                        alt="" />
                                                    <span class="ltr:ml-3 rtl:mr-3">{{ item.name }}</span>
                                                </button>
                                            </li>
                                        </template>
                                    </ul>
                                </template>
                            </Popper>
                        </client-only>
                    </div>

                    <div class="dropdown shrink-0">
                        <client-only>
                            <Popper :placement="store.rtlClass === 'rtl' ? 'bottom-start' : 'bottom-end'"
                                offsetDistance="8">
                                <button type="button"
                                    class="block rounded-full bg-white-light/40 p-2 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60">
                                    <icon-mail-dot />
                                </button>
                                <template #content="{ close }">
                                    <ul
                                        class="top-11 w-[300px] !py-0 text-xs text-dark dark:text-white-dark sm:w-[375px]">
                                        <li class="mb-5">
                                            <div class="relative overflow-hidden rounded-t-md !p-5 text-white">
                                                <div
                                                    class="absolute inset-0 h-full w-full bg-[url('/assets/images/menu-heade.jpg')] bg-cover bg-center bg-no-repeat">
                                                </div>
                                                <h4 class="relative z-10 text-lg font-semibold">Messages</h4>
                                            </div>
                                        </li>
                                        <template v-for="msg in messages" :key="msg.id">
                                            <li>
                                                <div class="flex items-center px-5 py-3">
                                                    <div v-html="msg.image"></div>
                                                    <span class="px-3 dark:text-gray-500">
                                                        <div class="text-sm font-semibold dark:text-white-light/90"
                                                            v-text="msg.title"></div>
                                                        <div v-text="msg.message"></div>
                                                    </span>
                                                    <span
                                                        class="whitespace-pre rounded bg-white-dark/20 px-1 font-semibold text-dark/60 ltr:ml-auto ltr:mr-2 rtl:ml-2 rtl:mr-auto dark:text-white-dark"
                                                        v-text="msg.time"></span>
                                                    <button type="button" class="text-neutral-300 hover:text-danger"
                                                        @click="removeMessage(msg.id)">
                                                        <icon-x-circle />
                                                    </button>
                                                </div>
                                            </li>
                                        </template>
                                        <template v-if="messages.length">
                                            <li
                                                class="mt-5 border-t border-white-light text-center dark:border-white/10">
                                                <div class="group flex cursor-pointer items-center justify-center px-5 py-4 font-semibold text-primary dark:text-gray-400"
                                                    @click="close()">
                                                    <span class="group-hover:underline ltr:mr-1 rtl:ml-1">VIEW ALL
                                                        ACTIVITIES</span>

                                                    <icon-arrow-left
                                                        class="transition duration-300 group-hover:translate-x-1 ltr:ml-1 rtl:mr-1" />
                                                </div>
                                            </li>
                                        </template>
                                        <template v-if="!messages.length">
                                            <li class="mb-5">
                                                <div
                                                    class="!grid min-h-[200px] place-content-center text-lg hover:!bg-transparent">
                                                    <div
                                                        class="mx-auto mb-4 rounded-full text-primary ring-4 ring-primary/30">
                                                        <icon-info-circle :fill="true" class="h-10 w-10" />
                                                    </div>
                                                    No data available.
                                                </div>
                                            </li>
                                        </template>
                                    </ul>
                                </template>
                            </Popper>
                        </client-only>
                    </div>

                    <div class="dropdown shrink-0">
                        <client-only>
                            <Popper :placement="store.rtlClass === 'rtl' ? 'bottom-end' : 'bottom-start'"
                                offsetDistance="8">
                                <button type="button"
                                    class="relative block rounded-full bg-white-light/40 p-2 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60">
                                    <icon-bell-bing />

                                    <span class="absolute top-0 flex h-3 w-3 ltr:right-0 rtl:left-0">
                                        <span
                                            class="absolute -top-[3px] inline-flex h-full w-full animate-ping rounded-full bg-success/50 opacity-75 ltr:-left-[3px] rtl:-right-[3px]"></span>
                                        <span
                                            class="relative inline-flex h-[6px] w-[6px] rounded-full bg-success"></span>
                                    </span>
                                </button>
                                <template #content="{ close }">
                                    <ul
                                        class="w-[300px] divide-y !py-0 text-dark dark:divide-white/10 dark:text-white-dark sm:w-[350px]">
                                        <li>
                                            <div class="flex items-center justify-between px-4 py-2 font-semibold">
                                                <h4 class="text-lg">Notification</h4>
                                                <template v-if="notifications.length">
                                                    <span class="badge bg-primary/80"
                                                        v-text="notifications.length + 'New'"></span>
                                                </template>
                                            </div>
                                        </li>
                                        <template v-for="notification in notifications" :key="notification.id">
                                            <li class="dark:text-white-light/90">
                                                <div class="group flex items-center px-4 py-2">
                                                    <div class="grid place-content-center rounded">
                                                        <div class="relative h-12 w-12">
                                                            <img class="h-12 w-12 rounded-full object-cover"
                                                                :src="`/assets/images/${notification.profile}`"
                                                                alt="" />
                                                            <span
                                                                class="absolute bottom-0 right-[6px] block h-2 w-2 rounded-full bg-success"></span>
                                                        </div>
                                                    </div>
                                                    <div class="flex flex-auto ltr:pl-3 rtl:pr-3">
                                                        <div class="ltr:pr-3 rtl:pl-3">
                                                            <h6 v-html="notification.message"></h6>
                                                            <span class="block text-xs font-normal dark:text-gray-500"
                                                                v-text="notification.time"></span>
                                                        </div>
                                                        <button type="button"
                                                            class="text-neutral-300 opacity-0 hover:text-danger group-hover:opacity-100 ltr:ml-auto rtl:mr-auto"
                                                            @click="removeNotification(notification.id)">
                                                            <icon-x-circle />
                                                        </button>
                                                    </div>
                                                </div>
                                            </li>
                                        </template>
                                        <template v-if="notifications.length">
                                            <li>
                                                <div class="p-4">
                                                    <button class="btn btn-primary btn-small block w-full"
                                                        @click="close()">Read All Notifications</button>
                                                </div>
                                            </li>
                                        </template>
                                        <template v-if="!notifications.length">
                                            <li>
                                                <div
                                                    class="!grid min-h-[200px] place-content-center text-lg hover:!bg-transparent">
                                                    <div
                                                        class="mx-auto mb-4 rounded-full text-primary ring-4 ring-primary/30">
                                                        <icon-info-circle :fill="true" class="h-10 w-10" />
                                                    </div>
                                                    No data available.
                                                </div>
                                            </li>
                                        </template>
                                    </ul>
                                </template>
                            </Popper>
                        </client-only>
                    </div>

                    <div class="dropdown shrink-0">
                        <client-only>
                            <Popper :placement="store.rtlClass === 'rtl' ? 'bottom-end' : 'bottom-start'"
                                offsetDistance="8" class="!block">
                                <button type="button" class="group relative block">
                                    <img class="h-9 w-9 rounded-full object-cover saturate-50 group-hover:saturate-100"
                                        src="/assets/images/user-profile.jpeg" alt="" />
                                </button>
                                <template #content="{ close }">
                                    <ul
                                        class="w-[230px] !py-0 font-semibold text-dark dark:text-white-dark dark:text-white-light/90">
                                        <li>
                                            <div class="flex items-center px-4 py-4">
                                                <div class="flex-none">
                                                    <img class="h-10 w-10 rounded-md object-cover"
                                                        src="/assets/images/user-profile.jpeg" alt="" />
                                                </div>
                                                <div class="truncate ltr:pl-4 rtl:pr-4">
                                                    <h4 class="text-base">
                                                        John Doe<span
                                                            class="rounded bg-success-light px-1 text-xs text-success ltr:ml-2 rtl:ml-2">Pro</span>
                                                    </h4>
                                                    <a class="text-black/60 hover:text-primary dark:text-dark-light/60 dark:hover:text-white"
                                                        href="javascript:;">johndoe@gmail.com</a>
                                                </div>
                                            </div>
                                        </li>
                                        <li>
                                            <button type="button" class="dark:hover:text-white" @click="close()">
                                                <icon-user class="h-4.5 w-4.5 shrink-0 ltr:mr-2 rtl:ml-2" />

                                                Profile
                                            </button>
                                        </li>
                                        <li>
                                            <button type="button" class="dark:hover:text-white" @click="close()">
                                                <icon-mail class="h-4.5 w-4.5 shrink-0 ltr:mr-2 rtl:ml-2" />

                                                Inbox
                                            </button>
                                        </li>
                                        <li>
                                            <button type="button" class="dark:hover:text-white" @click="close()">
                                                <icon-lock-dots class="h-4.5 w-4.5 shrink-0 ltr:mr-2 rtl:ml-2" />

                                                Lock Screen
                                            </button>
                                        </li>
                                        <li class="border-t border-white-light dark:border-white-light/10">
                                            <button type="button" class="!py-3 text-danger" @click="close()">
                                                <icon-logout class="h-4.5 w-4.5 shrink-0 rotate-90 ltr:mr-2 rtl:ml-2" />

                                                Sign Out
                                            </button>
                                        </li>
                                    </ul>
                                </template>
                            </Popper>
                        </client-only>
                    </div>
                </div>
            </div>

            <!-- horizontal menu -->
            <ul
                class="horizontal-menu hidden border-t border-[#ebedf2] bg-white px-6 py-1.5 font-semibold text-black rtl:space-x-reverse dark:border-[#191e3a] dark:bg-[#0e1726] dark:text-white-dark lg:space-x-1.5 xl:space-x-8">
                <li class="menu nav-item relative">
                    <a href="javascript:;" class="nav-link">
                        <div class="flex items-center">
                            <icon-menu-dashboard class="shrink-0" />

                            <span class="px-2">{{ $t('dashboard') }}</span>
                        </div>
                        <div class="right_arrow">
                            <icon-caret-down />
                        </div>
                    </a>
                    <ul class="sub-menu">
                        <li>
                            <NuxtLink to="/">{{ $t('sales') }}</NuxtLink>
                        </li>
                        <li>
                            <a href="javascript:;">{{ $t('analytics') }}</a>
                        </li>
                        <li>
                            <a href="javascript:;">{{ $t('finance') }}</a>
                        </li>
                        <li>
                            <a href="javascript:;">{{ $t('crypto') }}</a>
                        </li>
                    </ul>
                </li>
                <li class="menu nav-item relative">
                    <a href="javascript:;" class="nav-link">
                        <div class="flex items-center">
                            <icon-menu-apps class="shrink-0" />

                            <span class="px-2">{{ $t('apps') }}</span>
                        </div>
                        <div class="right_arrow">
                            <icon-caret-down />
                        </div>
                    </a>
                    <ul class="sub-menu">
                        <li>
                            <a href="javascript:;">{{ $t('chat') }}</a>
                        </li>
                        <li>
                            <a href="javascript:;">{{ $t('mailbox') }}</a>
                        </li>
                        <li>
                            <a href="javascript:;">{{ $t('todo_list') }}</a>
                        </li>
                        <li>
                            <a href="javascript:;">{{ $t('notes') }}</a>
                        </li>
                        <li>
                            <a href="javascript:;">{{ $t('scrumboard') }}</a>
                        </li>
                        <li>
                            <a href="javascript:;">{{ $t('contacts') }}</a>
                        </li>
                        <li class="relative">
                            <a href="javascript:;">{{ $t('invoice') }}
                                <div class="-rotate-90 ltr:ml-auto rtl:mr-auto rtl:rotate-90">
                                    <icon-caret-down />
                                </div>
                            </a>
                            <ul
                                class="absolute top-0 z-[10] hidden min-w-[180px] rounded bg-white p-0 py-2 text-dark shadow ltr:left-[95%] rtl:right-[95%] dark:bg-[#1b2e4b] dark:text-white-dark">
                                <li>
                                    <a href="javascript:;">{{ $t('list') }}</a>
                                </li>
                                <li>
                                    <a href="javascript:;">{{ $t('preview') }}</a>
                                </li>
                                <li>
                                    <a href="javascript:;">{{ $t('add') }}</a>
                                </li>
                                <li>
                                    <a href="javascript:;">{{ $t('edit') }}</a>
                                </li>
                            </ul>
                        </li>
                        <li>
                            <a href="javascript:;">{{ $t('calendar') }}</a>
                        </li>
                    </ul>
                </li>
            </ul>
        </div>
    </header>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed, reactive, watch } from 'vue';

import appSetting from '@/app-setting';

import { useRoute } from 'vue-router';
import { useAppStore } from '@/stores/index';
const store = useAppStore();
const route = useRoute();
const search = ref(false);
const { setLocale } = useI18n();

// multi language
const changeLanguage = (item: any) => {
    appSetting.toggleLanguage(item, setLocale);
};
const currentFlag = computed(() => {
    return `/assets/images/flags/${store.locale?.toUpperCase()}.svg`;
});

const notifications = ref([
    {
        id: 1,
        profile: 'user-profile.jpeg',
        message: '<strong class="text-sm mr-1">John Doe</strong>invite you to <strong>Prototyping</strong>',
        time: '45 min ago',
    },
    {
        id: 2,
        profile: 'profile-34.jpeg',
        message: '<strong class="text-sm mr-1">Adam Nolan</strong>mentioned you to <strong>UX Basics</strong>',
        time: '9h Ago',
    },
    {
        id: 3,
        profile: 'profile-16.jpeg',
        message: '<strong class="text-sm mr-1">Anna Morgan</strong>Upload a file',
        time: '9h Ago',
    },
]);

const messages = ref([
    {
        id: 1,
        image: '<span class="grid place-content-center w-9 h-9 rounded-full bg-success-light dark:bg-success text-success dark:text-success-light"><svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg></span>',
        title: 'Congratulations!',
        message: 'Your OS has been updated.',
        time: '1hr',
    },
    {
        id: 2,
        image: '<span class="grid place-content-center w-9 h-9 rounded-full bg-info-light dark:bg-info text-info dark:text-info-light"><svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></span>',
        title: 'Did you know?',
        message: 'You can switch between artboards.',
        time: '2hr',
    },
    {
        id: 3,
        image: '<span class="grid place-content-center w-9 h-9 rounded-full bg-danger-light dark:bg-danger text-danger dark:text-danger-light"> <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></span>',
        title: 'Something went wrong!',
        message: 'Send Reposrt',
        time: '2days',
    },
    {
        id: 4,
        image: '<span class="grid place-content-center w-9 h-9 rounded-full bg-warning-light dark:bg-warning text-warning dark:text-warning-light"><svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">    <circle cx="12" cy="12" r="10"></circle>    <line x1="12" y1="8" x2="12" y2="12"></line>    <line x1="12" y1="16" x2="12.01" y2="16"></line></svg></span>',
        title: 'Warning',
        message: 'Your password strength is low.',
        time: '5days',
    },
]);

onMounted(() => {
    setActiveDropdown();
});

watch(route, (to, from) => {
    setActiveDropdown();
});

const setActiveDropdown = () => {
    const selector = document.querySelector('ul.horizontal-menu a[href="' + window.location.pathname + '"]');
    if (selector) {
        selector.classList.add('active');
        const all: any = document.querySelectorAll('ul.horizontal-menu .nav-link.active');
        for (let i = 0; i < all.length; i++) {
            all[0]?.classList.remove('active');
        }
        const ul: any = selector.closest('ul.sub-menu');
        if (ul) {
            let ele: any = ul.closest('li.menu').querySelectorAll('.nav-link');
            if (ele) {
                ele = ele[0];
                setTimeout(() => {
                    ele?.classList.add('active');
                });
            }
        }
    }
};

const removeNotification = (value: number) => {
    notifications.value = notifications.value.filter((d) => d.id !== value);
};

const removeMessage = (value: number) => {
    messages.value = messages.value.filter((d) => d.id !== value);
};
</script>
